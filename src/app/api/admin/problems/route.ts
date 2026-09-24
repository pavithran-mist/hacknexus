import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");
    const themeId = searchParams.get("themeId");

    const where: any = {};
    if (hackathonId) where.hackathonId = hackathonId;
    if (themeId) where.themeId = themeId;

    const problems = await prisma.problemStatement.findMany({
      where,
      orderBy: { problemCode: "asc" },
      include: {
        theme: true,
        hackathon: { select: { id: true, name: true } },
        _count: { select: { teams: true } },
      },
    });

    return NextResponse.json({ problems });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const {
      hackathonId,
      themeId,
      problemCode,
      title,
      description,
      organization,
      difficulty = "MEDIUM",
      technologies,
      requirements,
      expectedOutput,
      status = "ACTIVE",
    } = body;

    if (!hackathonId || !themeId || !problemCode || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await prisma.problemStatement.create({
      data: {
        hackathonId,
        themeId,
        problemCode,
        title,
        description,
        organization: organization || "HackNexus Consortium",
        difficulty,
        technologies: technologies || "Full-Stack",
        requirements: requirements || "Working functional prototype",
        expectedOutput: expectedOutput || "Demonstrated live deployment",
        status,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROBLEM_CREATED",
      entity: "ProblemStatement",
      entityId: problem.id,
      metadata: { code: problem.problemCode, title: problem.title },
    });

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Problem create error:", error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}
