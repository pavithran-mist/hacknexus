import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");

    const where: any = {};
    if (hackathonId) where.hackathonId = hackathonId;

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        team: {
          include: {
            leader: { select: { name: true, email: true } },
            theme: { select: { name: true } },
            problem: { select: { problemCode: true, title: true } },
            members: true,
          },
        },
        hackathon: { select: { id: true, name: true } },
        judgeAssignments: {
          include: {
            judge: {
              include: { user: { select: { name: true, email: true } } },
            },
            scores: {
              include: { criterion: true },
            },
          },
        },
        scores: {
          include: { criterion: true },
        },
      },
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
