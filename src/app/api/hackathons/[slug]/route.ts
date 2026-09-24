import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const hackathon = await prisma.hackathon.findUnique({
      where: { slug },
      include: {
        themes: {
          where: { status: "ACTIVE" },
          orderBy: { order: "asc" },
        },
        problems: {
          where: { status: "ACTIVE" },
          include: {
            theme: true,
          },
          orderBy: { problemCode: "asc" },
        },
        timelineEvents: {
          orderBy: { order: "asc" },
        },
        sponsors: {
          orderBy: { order: "asc" },
        },
        announcements: {
          where: {
            OR: [
              { expiryDate: null },
              { expiryDate: { gte: new Date() } },
            ],
          },
          orderBy: { createdAt: "desc" },
        },
        websiteContent: true,
        _count: {
          select: {
            teams: true,
            problems: true,
            themes: true,
          },
        },
      },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ hackathon });
  } catch (error) {
    console.error("Failed to fetch hackathon:", error);
    return NextResponse.json({ error: "Failed to load hackathon" }, { status: 500 });
  }
}
