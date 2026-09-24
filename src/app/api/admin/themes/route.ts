import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");

    const themes = await prisma.theme.findMany({
      where: hackathonId ? { hackathonId } : undefined,
      orderBy: { order: "asc" },
      include: {
        hackathon: { select: { id: true, name: true } },
        _count: { select: { problems: true, teams: true } },
      },
    });

    return NextResponse.json({ themes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { hackathonId, name, description, icon, order = 0, status = "ACTIVE" } = body;

    if (!hackathonId || !name || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        hackathonId,
        name,
        description,
        icon: icon || "Tag",
        order: Number(order),
        status,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "THEME_CREATED",
      entity: "Theme",
      entityId: theme.id,
      metadata: { name: theme.name },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}
