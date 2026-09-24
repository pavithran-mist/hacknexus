import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problem = await prisma.problemStatement.findUnique({
      where: { id: params.id },
      include: {
        theme: true,
        hackathon: true,
        _count: { select: { teams: true } },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const problem = await prisma.problemStatement.update({
      where: { id: params.id },
      data: {
        themeId: body.themeId !== undefined ? body.themeId : undefined,
        problemCode: body.problemCode !== undefined ? body.problemCode : undefined,
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        organization: body.organization !== undefined ? body.organization : undefined,
        difficulty: body.difficulty !== undefined ? body.difficulty : undefined,
        technologies: body.technologies !== undefined ? body.technologies : undefined,
        requirements: body.requirements !== undefined ? body.requirements : undefined,
        expectedOutput: body.expectedOutput !== undefined ? body.expectedOutput : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
      include: { theme: true },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROBLEM_UPDATED",
      entity: "ProblemStatement",
      entityId: problem.id,
      metadata: { code: problem.problemCode, title: problem.title },
    });

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    await prisma.problemStatement.delete({
      where: { id: params.id },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROBLEM_DELETED",
      entity: "ProblemStatement",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}

// Duplicate problem statement
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const original = await prisma.problemStatement.findUnique({
      where: { id: params.id },
    });

    if (!original) {
      return NextResponse.json({ error: "Original problem not found" }, { status: 404 });
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const duplicated = await prisma.problemStatement.create({
      data: {
        hackathonId: original.hackathonId,
        themeId: original.themeId,
        problemCode: `${original.problemCode}-DUP${randomNum}`,
        title: `${original.title} (Copy)`,
        description: original.description,
        organization: original.organization,
        difficulty: original.difficulty,
        technologies: original.technologies,
        requirements: original.requirements,
        expectedOutput: original.expectedOutput,
        status: "ACTIVE",
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROBLEM_DUPLICATED",
      entity: "ProblemStatement",
      entityId: duplicated.id,
      metadata: { originalCode: original.problemCode, newCode: duplicated.problemCode },
    });

    return NextResponse.json({ success: true, problem: duplicated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to duplicate problem" }, { status: 500 });
  }
}
