import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim().toLowerCase();

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { transactionId: { contains: search } },
        { team: { name: { contains: search } } },
        { registration: { registrationNumber: { contains: search } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            leader: { select: { name: true, email: true } },
          },
        },
        registration: {
          select: {
            id: true,
            registrationNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
