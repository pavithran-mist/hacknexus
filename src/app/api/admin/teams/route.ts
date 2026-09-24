import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);

    const hackathonId = searchParams.get("hackathonId");
    const themeId = searchParams.get("themeId");
    const problemId = searchParams.get("problemId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search")?.trim().toLowerCase();

    const where: any = {};
    if (hackathonId) where.hackathonId = hackathonId;
    if (themeId) where.themeId = themeId;
    if (problemId) where.problemId = problemId;
    if (status) where.status = status;
    if (paymentStatus) {
      where.registration = { status: paymentStatus };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { college: { contains: search } },
        { leader: { name: { contains: search } } },
        { leader: { email: { contains: search } } },
        { registration: { registrationNumber: { contains: search } } },
      ];
    }

    const teams = await prisma.team.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        leader: { select: { id: true, name: true, email: true, phone: true } },
        theme: { select: { id: true, name: true } },
        problem: { select: { id: true, problemCode: true, title: true } },
        members: true,
        registration: {
          select: {
            id: true,
            registrationNumber: true,
            feeAmount: true,
            status: true,
            currency: true,
          },
        },
        payments: {
          select: {
            id: true,
            transactionId: true,
            status: true,
            amount: true,
            isDemo: true,
          },
        },
        prototype: { select: { id: true, status: true, prototypeUrl: true } },
        submission: { select: { id: true, submissionNumber: true, status: true } },
      },
    });

    return NextResponse.json({ teams });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
