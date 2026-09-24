import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { judgeId, submissionId } = body;

    if (!judgeId || !submissionId) {
      return NextResponse.json({ error: "Judge ID and Submission ID required" }, { status: 400 });
    }

    const assignment = await prisma.judgeAssignment.upsert({
      where: {
        judgeId_submissionId: {
          judgeId,
          submissionId,
        },
      },
      update: {
        status: "ASSIGNED",
      },
      create: {
        judgeId,
        submissionId,
        status: "ASSIGNED",
      },
      include: {
        judge: { include: { user: true } },
        submission: { include: { team: true } },
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "JUDGE_ASSIGNED",
      entity: "JudgeAssignment",
      entityId: assignment.id,
      metadata: {
        judgeName: assignment.judge.user.name,
        teamName: assignment.submission.team.name,
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to assign judge" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
    }

    await prisma.judgeAssignment.delete({
      where: { id: assignmentId },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "JUDGE_UNASSIGNED",
      entity: "JudgeAssignment",
      entityId: assignmentId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to remove assignment" }, { status: 500 });
  }
}
