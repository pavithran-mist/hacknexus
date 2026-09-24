import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        leader: true,
        hackathon: true,
        theme: true,
        problem: true,
        members: true,
        registration: true,
        payments: true,
        prototype: true,
        submission: {
          include: {
            judgeAssignments: {
              include: {
                judge: { include: { user: true } },
                scores: { include: { criterion: true } },
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        status: body.status !== undefined ? body.status : undefined,
        name: body.name !== undefined ? body.name : undefined,
        college: body.college !== undefined ? body.college : undefined,
        department: body.department !== undefined ? body.department : undefined,
        themeId: body.themeId !== undefined ? body.themeId : undefined,
        problemId: body.problemId !== undefined ? body.problemId : undefined,
      },
      include: { leader: true },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "TEAM_UPDATED",
      entity: "Team",
      entityId: team.id,
      metadata: { name: team.name, status: team.status },
    });

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    await prisma.team.delete({
      where: { id: params.id },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "TEAM_DELETED",
      entity: "Team",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
