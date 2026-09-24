import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["JUDGE", "ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { assignmentId, scores, feedback } = body;

    if (!assignmentId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Invalid scoring payload" }, { status: 400 });
    }

    const assignment = await prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        judge: true,
        submission: {
          include: { team: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Verify judge identity
    if (assignment.judge.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "You are not assigned to evaluate this team" }, { status: 403 });
    }

    // Upsert each evaluation score
    for (const item of scores) {
      await prisma.evaluationScore.upsert({
        where: {
          assignmentId_criterionId: {
            assignmentId: assignment.id,
            criterionId: item.criterionId,
          },
        },
        update: {
          score: Number(item.score),
          feedback: item.feedback || null,
        },
        create: {
          assignmentId: assignment.id,
          judgeId: assignment.judgeId,
          submissionId: assignment.submissionId,
          criterionId: item.criterionId,
          score: Number(item.score),
          feedback: item.feedback || null,
        },
      });
    }

    // Mark assignment completed
    await prisma.judgeAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED" },
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: assignment.submissionId },
      data: { status: "EVALUATED" },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "SUBMISSION_EVALUATED",
      entity: "Submission",
      entityId: assignment.submissionId,
      metadata: {
        teamName: assignment.submission.team.name,
        submissionNumber: assignment.submission.submissionNumber,
        scoresCount: scores.length,
      },
    });

    return NextResponse.json({ success: true, message: "Evaluation saved successfully" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
  }
}
