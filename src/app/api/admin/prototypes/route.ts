import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const prototypes = await prisma.prototype.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        team: {
          include: {
            leader: { select: { name: true, email: true } },
            theme: { select: { name: true } },
            problem: { select: { problemCode: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ prototypes });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch prototypes" }, { status: 500 });
  }
}
