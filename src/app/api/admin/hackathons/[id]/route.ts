import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        themes: true,
        problems: true,
        evaluationCriteria: true,
        websiteContent: true,
      },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ hackathon });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch hackathon" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const currentHackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!currentHackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const updated = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        tagline: body.tagline !== undefined ? body.tagline : undefined,
        description: body.description !== undefined ? body.description : undefined,
        registrationFee: body.registrationFee !== undefined ? Number(body.registrationFee) : undefined,
        currency: body.currency !== undefined ? body.currency : undefined,
        minTeamSize: body.minTeamSize !== undefined ? Number(body.minTeamSize) : undefined,
        maxTeamSize: body.maxTeamSize !== undefined ? Number(body.maxTeamSize) : undefined,
        registrationStartDate: body.registrationStartDate ? new Date(body.registrationStartDate) : undefined,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
        hackathonStartDate: body.hackathonStartDate ? new Date(body.hackathonStartDate) : undefined,
        hackathonEndDate: body.hackathonEndDate ? new Date(body.hackathonEndDate) : undefined,
        submissionDeadline: body.submissionDeadline ? new Date(body.submissionDeadline) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        contactEmail: body.contactEmail !== undefined ? body.contactEmail : undefined,
        contactPhone: body.contactPhone !== undefined ? body.contactPhone : undefined,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "HACKATHON_UPDATED",
      entity: "Hackathon",
      entityId: updated.id,
      metadata: {
        previousFee: currentHackathon.registrationFee,
        newFee: updated.registrationFee,
        name: updated.name,
      },
    });

    return NextResponse.json({ success: true, hackathon: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Hackathon update error:", error);
    return NextResponse.json({ error: "Failed to update hackathon" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"]);
    await prisma.hackathon.delete({
      where: { id: params.id },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "HACKATHON_DELETED",
      entity: "Hackathon",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete hackathon" }, { status: 500 });
  }
}
