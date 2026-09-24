import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        teams: [],
        participants: [],
        registrations: [],
        payments: [],
        problems: [],
        submissions: [],
      });
    }

    const [teams, participants, registrations, payments, problems, submissions] =
      await Promise.all([
        prisma.team.findMany({
          where: { name: { contains: q } },
          take: 5,
          include: { leader: { select: { name: true, email: true } } },
        }),
        prisma.teamMember.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          },
          take: 5,
          include: { team: { select: { name: true, id: true } } },
        }),
        prisma.registration.findMany({
          where: { registrationNumber: { contains: q } },
          take: 5,
          include: { team: { select: { name: true } } },
        }),
        prisma.payment.findMany({
          where: { transactionId: { contains: q } },
          take: 5,
          include: { team: { select: { name: true } } },
        }),
        prisma.problemStatement.findMany({
          where: {
            OR: [
              { problemCode: { contains: q } },
              { title: { contains: q } },
            ],
          },
          take: 5,
        }),
        prisma.submission.findMany({
          where: {
            OR: [
              { submissionNumber: { contains: q } },
              { projectTitle: { contains: q } },
              { prototypeUrl: { contains: q } },
            ],
          },
          take: 5,
          include: { team: { select: { name: true } } },
        }),
      ]);

    return NextResponse.json({
      teams,
      participants,
      registrations,
      payments,
      problems,
      submissions,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
