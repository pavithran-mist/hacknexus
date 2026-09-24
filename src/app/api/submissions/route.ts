import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";
import { finalSubmissionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = finalSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check Hackathon and deadline
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: data.hackathonId },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const now = new Date();
    if (now > hackathon.submissionDeadline) {
      return NextResponse.json(
        {
          error: `Submission Closed. The deadline (${hackathon.submissionDeadline.toLocaleString()}) has passed.`,
        },
        { status: 400 }
      );
    }

    // Verify team
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: { registration: true, submission: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.leaderId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!team.registration || team.registration.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Team registration must be confirmed and paid before submitting." },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const subNumber = `SUB-2026-${randomSuffix}`;

    let submission;
    if (team.submission) {
      submission = await prisma.submission.update({
        where: { id: team.submission.id },
        data: {
          projectTitle: data.projectTitle,
          projectDescription: data.projectDescription,
          prototypeUrl: data.prototypeUrl,
          githubUrl: data.githubUrl,
          demoVideoUrl: data.demoVideoUrl || null,
          pptUrl: data.pptUrl || null,
          documentationUrl: data.documentationUrl || null,
          technologies: data.technologies,
          expectedImpact: data.expectedImpact,
          futureScope: data.futureScope,
          status: "SUBMITTED",
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          submissionNumber: subNumber,
          teamId: team.id,
          hackathonId: hackathon.id,
          projectTitle: data.projectTitle,
          projectDescription: data.projectDescription,
          prototypeUrl: data.prototypeUrl,
          githubUrl: data.githubUrl,
          demoVideoUrl: data.demoVideoUrl || null,
          pptUrl: data.pptUrl || null,
          documentationUrl: data.documentationUrl || null,
          technologies: data.technologies,
          expectedImpact: data.expectedImpact,
          futureScope: data.futureScope,
          status: "SUBMITTED",
        },
      });
    }

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "FINAL_SUBMISSION_COMPLETED",
      entity: "Submission",
      entityId: submission.id,
      metadata: {
        submissionNumber: submission.submissionNumber,
        projectTitle: data.projectTitle,
        teamName: team.name,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Project Submitted Successfully!",
        message: `Your final submission for "${data.projectTitle}" (ID: ${submission.submissionNumber}) has been received and queued for judging.`,
        type: "SUBMISSION",
        link: "/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      submissionNumber: submission.submissionNumber,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Failed to submit project" }, { status: 500 });
  }
}
