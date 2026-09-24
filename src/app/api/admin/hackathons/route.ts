import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            teams: true,
            themes: true,
            problems: true,
            submissions: true,
            judges: true,
          },
        },
      },
    });
    return NextResponse.json({ hackathons });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const {
      name,
      slug,
      tagline,
      description,
      registrationFee,
      currency = "INR",
      minTeamSize = 2,
      maxTeamSize = 4,
      registrationStartDate,
      registrationDeadline,
      hackathonStartDate,
      hackathonEndDate,
      submissionDeadline,
      status = "REGISTRATION_OPEN",
      contactEmail,
      contactPhone,
    } = body;

    if (!name || !slug || !tagline || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.hackathon.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: "Hackathon with this slug already exists" }, { status: 409 });
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        name,
        slug,
        tagline,
        description,
        registrationFee: Number(registrationFee) || 0,
        currency,
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        registrationStartDate: new Date(registrationStartDate || Date.now()),
        registrationDeadline: new Date(registrationDeadline || Date.now() + 15 * 86400000),
        hackathonStartDate: new Date(hackathonStartDate || Date.now() + 20 * 86400000),
        hackathonEndDate: new Date(hackathonEndDate || Date.now() + 22 * 86400000),
        submissionDeadline: new Date(submissionDeadline || Date.now() + 21 * 86400000),
        status,
        contactEmail,
        contactPhone,
      },
    });

    // Create default website content
    await prisma.websiteContent.create({
      data: {
        hackathonId: hackathon.id,
        heroTitle: "Turn Your Ideas Into Innovation",
        heroSubtitle: tagline,
        aboutText: description,
        contactEmail,
        contactPhone,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "HACKATHON_CREATED",
      entity: "Hackathon",
      entityId: hackathon.id,
      metadata: { name: hackathon.name, fee: hackathon.registrationFee },
    });

    return NextResponse.json({ success: true, hackathon });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Hackathon create error:", error);
    return NextResponse.json({ error: "Failed to create hackathon" }, { status: 500 });
  }
}
