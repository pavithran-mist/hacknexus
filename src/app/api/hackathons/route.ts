import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            teams: true,
            problems: true,
            themes: true,
          },
        },
      },
    });

    return NextResponse.json({ hackathons });
  } catch (error) {
    console.error("Failed to fetch hackathons:", error);
    return NextResponse.json({ error: "Failed to load hackathons" }, { status: 500 });
  }
}
