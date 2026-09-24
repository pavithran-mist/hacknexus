import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);

    // Fetch submissions with evaluation scores
    const submissions = await prisma.submission.findMany({
      include: {
        team: {
          include: {
            theme: true,
            problem: true,
            leader: true,
            members: true,
          },
        },
        scores: {
          include: {
            criterion: true,
            judge: {
              include: {
                user: true,
              },
            },
          },
        },
        judgeAssignments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const hackathon = await prisma.hackathon.findFirst({
      where: { isFeatured: true },
      select: { id: true, name: true, resultsPublished: true, resultsAnnouncedAt: true },
    });

    // Compute average score for each submission
    const formatted = submissions.map((sub) => {
      const totalScore = sub.scores.reduce((acc, s) => acc + s.score, 0);
      const averageScore = sub.scores.length > 0 ? Number((totalScore / (sub.judgeAssignments.length || 1)).toFixed(1)) : 0;

      return {
        id: sub.id,
        submissionNumber: sub.submissionNumber,
        projectTitle: sub.projectTitle,
        teamName: sub.team.name,
        college: sub.team.college,
        themeName: sub.team.theme?.name || "General",
        problemCode: sub.team.problem?.problemCode || "N/A",
        rank: sub.rank,
        award: sub.award,
        isWinner: sub.isWinner,
        certificateIssued: sub.certificateIssued,
        certificateId: sub.certificateId,
        scoresCount: sub.scores.length,
        averageScore,
        membersCount: sub.team.members.length,
        status: sub.status,
      };
    });

    // Sort by averageScore descending by default
    formatted.sort((a, b) => b.averageScore - a.averageScore);

    return NextResponse.json({
      submissions: formatted,
      hackathon: hackathon || { resultsPublished: false },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load results" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { action, rankings, publishResults } = body;

    // Action 1: Save award assignments
    if (action === "SAVE_RANKS" && Array.isArray(rankings)) {
      for (const item of rankings) {
        await prisma.submission.update({
          where: { id: item.id },
          data: {
            rank: item.rank ? Number(item.rank) : null,
            award: item.award || null,
            isWinner: Boolean(item.isWinner),
          },
        });
      }

      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "RANKINGS_UPDATED",
        entity: "Submission",
        metadata: { count: rankings.length },
      });

      return NextResponse.json({ success: true, message: "Rankings and awards updated." });
    }

    // Action 2: Publish Hackathon Results & Issue Official Certificates
    if (action === "PUBLISH_RESULTS") {
      const hackathon = await prisma.hackathon.findFirst({
        where: { isFeatured: true },
      });

      if (!hackathon) {
        return NextResponse.json({ error: "No active hackathon found" }, { status: 404 });
      }

      const submissions = await prisma.submission.findMany({
        where: { hackathonId: hackathon.id },
        include: {
          team: {
            include: {
              members: true,
              leader: true,
            },
          },
        },
      });

      // Update submissions with Certificate IDs
      for (const sub of submissions) {
        const certCode = sub.certificateId || `CERT-HN2026-${sub.team.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")}-${Math.floor(10000 + Math.random() * 90000)}`;

        await prisma.submission.update({
          where: { id: sub.id },
          data: {
            certificateIssued: true,
            certificateId: certCode,
            status: "EVALUATED",
          },
        });

        // Create individual participant notifications
        for (const member of sub.team.members) {
          const userRec = await prisma.user.findUnique({
            where: { email: member.email.toLowerCase() },
          });

          if (userRec) {
            await prisma.notification.create({
              data: {
                userId: userRec.id,
                title: "🏆 Hackathon Results & Certificates Published!",
                message: `Congratulations! Official results and merit certificates for ${hackathon.name} have been released. View your certificate in your dashboard.`,
                type: "ANNOUNCEMENT",
                link: `/certificate/${certCode}`,
              },
            });
          }
        }
      }

      // Mark hackathon resultsPublished = true
      await prisma.hackathon.update({
        where: { id: hackathon.id },
        data: {
          resultsPublished: true,
          resultsAnnouncedAt: new Date(),
          status: "COMPLETED",
        },
      });

      // Post broadcast announcement
      await prisma.announcement.create({
        data: {
          hackathonId: hackathon.id,
          title: "🎉 Official Results & Certificates Released!",
          message:
            "The Jury has finalized all scores! Congratulations to all winners, finalists, and participants. Official verified certificates are now available for download in your dashboard.",
          priority: "HIGH",
          targetAudience: "EVERYONE",
        },
      });

      // Update System Setting
      await prisma.systemSetting.upsert({
        where: { key: "results_published" },
        update: { value: "true" },
        create: {
          key: "results_published",
          value: "true",
          description: "Global results published toggle",
        },
      });

      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "RESULTS_PUBLISHED",
        entity: "Hackathon",
        entityId: hackathon.id,
        metadata: { publishedAt: new Date().toISOString() },
      });

      return NextResponse.json({
        success: true,
        message: "Results published and certificates issued to all teams successfully!",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish results" }, { status: 500 });
  }
}
