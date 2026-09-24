import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");

    const where: any = {};
    if (hackathonId) where.hackathonId = hackathonId;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        hackathon: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { hackathonId, title, message, priority = "NORMAL", targetAudience = "EVERYONE", expiryDate } = body;

    if (!hackathonId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        hackathonId,
        title,
        message,
        priority,
        targetAudience,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Dispatch in-app notifications
    try {
      const targetUsers = await prisma.user.findMany({
        where: targetAudience === "EVERYONE" ? {} : { role: targetAudience === "JUDGES" ? "JUDGE" : "PARTICIPANT" },
        select: { id: true },
        take: 200,
      });

      if (targetUsers.length > 0) {
        await prisma.notification.createMany({
          data: targetUsers.map((u) => ({
            userId: u.id,
            title: `📢 ${title}`,
            message: message,
            type: "ANNOUNCEMENT",
            link: "/dashboard",
          })),
        });
      }
    } catch {
      // Non-blocking notification dispatch
    }

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "ANNOUNCEMENT_CREATED",
      entity: "Announcement",
      entityId: announcement.id,
      metadata: { title: announcement.title, priority },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
