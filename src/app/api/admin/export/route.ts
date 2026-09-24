import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    // 1. Fetch real database entities safely (excluding passwords and secrets)
    const [
      hackathons,
      themes,
      problems,
      teams,
      members,
      registrations,
      payments,
      prototypes,
      submissions,
      judges,
      assignments,
      scores,
      announcements,
      notifications,
      timeline,
      activityLogs,
      settings,
    ] = await Promise.all([
      prisma.hackathon.findMany(),
      prisma.theme.findMany(),
      prisma.problemStatement.findMany(),
      prisma.team.findMany(),
      prisma.teamMember.findMany(),
      prisma.registration.findMany(),
      prisma.payment.findMany({
        select: {
          id: true,
          transactionId: true,
          registrationId: true,
          teamId: true,
          amount: true,
          currency: true,
          gateway: true,
          status: true,
          isDemo: true,
          manualAdjustmentReason: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.prototype.findMany(),
      prisma.submission.findMany(),
      prisma.judge.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.judgeAssignment.findMany(),
      prisma.evaluationScore.findMany(),
      prisma.announcement.findMany(),
      prisma.notification.findMany(),
      prisma.timelineEvent.findMany(),
      prisma.activityLog.findMany({ take: 200, orderBy: { timestamp: "desc" } }),
      prisma.systemSetting.findMany(),
    ]);

    const exportedAt = new Date().toISOString();

    const exportData = {
      platform: {
        name: "HackNexus",
        version: "1.0.0",
        settings: settings.reduce((acc: any, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {}),
      },
      hackathons,
      themes,
      problems,
      teams,
      members,
      registrations,
      payments,
      prototypes,
      submissions,
      judges,
      assignments,
      scores,
      announcements,
      notifications,
      timeline,
      activityLogs,
      exportedAt,
    };

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "DATA_EXPORTED",
      entity: "Platform",
      metadata: { format, exportedAt },
    });

    if (format === "csv") {
      // Generate CSV of teams & registrations
      const csvHeader = "Team ID,Team Name,College,Theme ID,Status,Registration Number,Fee,Payment Status,Created At\n";
      const csvRows = teams.map((t) => {
        const reg = registrations.find((r) => r.teamId === t.id);
        return `"${t.id}","${t.name.replace(/"/g, '""')}","${t.college.replace(/"/g, '""')}","${t.themeId || ""}","${t.status}","${reg?.registrationNumber || ""}","${reg?.feeAmount || 0}","${reg?.status || "PENDING"}","${t.createdAt.toISOString()}"`;
      });
      const csvContent = csvHeader + csvRows.join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="hacknexus-teams-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
