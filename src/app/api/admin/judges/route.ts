import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword, logActivity } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const judges = await prisma.judge.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        hackathon: { select: { id: true, name: true } },
        assignments: {
          include: {
            submission: {
              include: { team: { select: { name: true } } },
            },
            scores: true,
          },
        },
      },
    });

    return NextResponse.json({ judges });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch judges" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const {
      name,
      email,
      password,
      hackathonId,
      designation,
      company,
      expertise,
      bio,
    } = body;

    if (!name || !email || !password || !hackathonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "JUDGE" },
      });
    } else {
      const passwordHash = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: "JUDGE",
        },
      });
    }

    const existingJudge = await prisma.judge.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId,
        },
      },
    });

    if (existingJudge) {
      return NextResponse.json({ error: "User is already a judge for this hackathon" }, { status: 409 });
    }

    const judge = await prisma.judge.create({
      data: {
        userId: user.id,
        hackathonId,
        designation: designation || "Evaluator",
        company: company || "Independent",
        expertise: expertise || "General Engineering",
        bio: bio || null,
      },
      include: {
        user: true,
      },
    });

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "JUDGE_CREATED",
      entity: "Judge",
      entityId: judge.id,
      metadata: { name, email, company },
    });

    return NextResponse.json({ success: true, judge });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Judge creation error:", error);
    return NextResponse.json({ error: "Failed to create judge" }, { status: 500 });
  }
}
