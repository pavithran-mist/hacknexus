import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");

    const events = await prisma.timelineEvent.findMany({
      where: hackathonId ? { hackathonId } : undefined,
      orderBy: { order: "asc" },
      include: { hackathon: { select: { name: true } } },
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timeline events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { hackathonId, title, description, date, time, order = 0, status = "UPCOMING" } = body;

    const event = await prisma.timelineEvent.create({
      data: {
        hackathonId,
        title,
        description,
        date,
        time,
        order: Number(order),
        status,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "TIMELINE_EVENT_CREATED",
      entity: "TimelineEvent",
      entityId: event.id,
      metadata: { title },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create timeline event" }, { status: 500 });
  }
}
