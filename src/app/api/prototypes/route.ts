import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";
import { prototypeSubmissionSchema } from "@/lib/validations";

// Participant updates their team's prototype
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { teamId, ...formData } = body;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { prototype: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify user is leader or admin
    if (team.leaderId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const parsed = prototypeSubmissionSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let prototype;
    if (team.prototype) {
      prototype = await prisma.prototype.update({
        where: { teamId: team.id },
        data: {
          prototypeUrl: data.prototypeUrl,
          githubUrl: data.githubUrl,
          videoUrl: data.videoUrl || null,
          projectDescription: data.projectDescription,
          technologies: data.technologies,
          status: "SUBMITTED",
        },
      });
    } else {
      prototype = await prisma.prototype.create({
        data: {
          teamId: team.id,
          prototypeUrl: data.prototypeUrl,
          githubUrl: data.githubUrl,
          videoUrl: data.videoUrl || null,
          projectDescription: data.projectDescription,
          technologies: data.technologies,
          status: "SUBMITTED",
        },
      });
    }

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROTOTYPE_SUBMITTED",
      entity: "Prototype",
      entityId: prototype.id,
      metadata: { teamName: team.name, prototypeUrl: data.prototypeUrl },
    });

    return NextResponse.json({ success: true, prototype });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Prototype submission error:", error);
    return NextResponse.json({ error: "Failed to update prototype" }, { status: 500 });
  }
}

// Admin updates prototype status (APPROVED, NEEDS_CHANGES, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { prototypeId, status, feedback } = body;

    if (!prototypeId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prototype = await prisma.prototype.update({
      where: { id: prototypeId },
      data: {
        status,
        feedback: feedback !== undefined ? feedback : undefined,
      },
      include: {
        team: {
          include: { leader: true, hackathon: true },
        },
      },
    });

    // Notify team leader
    await prisma.notification.create({
      data: {
        userId: prototype.team.leaderId,
        title: `Prototype Status: ${status.replace("_", " ")}`,
        message: feedback
          ? `Your prototype status was updated to ${status}. Feedback: ${feedback}`
          : `Your prototype status was updated to ${status}.`,
        type: "PROTOTYPE",
        link: "/dashboard",
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROTOTYPE_STATUS_CHANGED",
      entity: "Prototype",
      entityId: prototype.id,
      metadata: { status, teamName: prototype.team.name, feedback },
    });

    return NextResponse.json({ success: true, prototype });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Prototype patch error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
