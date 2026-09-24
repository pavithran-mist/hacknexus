import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const theme = await prisma.theme.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        icon: body.icon !== undefined ? body.icon : undefined,
        status: body.status !== undefined ? body.status : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "THEME_UPDATED",
      entity: "Theme",
      entityId: theme.id,
      metadata: { name: theme.name, status: theme.status },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    await prisma.theme.delete({
      where: { id: params.id },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "THEME_DELETED",
      entity: "Theme",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}
