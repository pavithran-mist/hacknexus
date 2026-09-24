import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"]);
    const body = await req.json();
    const { dataset, confirm = false } = body;

    if (!dataset || typeof dataset !== "object") {
      return NextResponse.json({ error: "Invalid JSON dataset provided" }, { status: 400 });
    }

    // 1. Schema inspection & counts preview
    const preview = {
      hackathons: Array.isArray(dataset.hackathons) ? dataset.hackathons.length : 0,
      themes: Array.isArray(dataset.themes) ? dataset.themes.length : 0,
      problems: Array.isArray(dataset.problems) ? dataset.problems.length : 0,
      teams: Array.isArray(dataset.teams) ? dataset.teams.length : 0,
      payments: Array.isArray(dataset.payments) ? dataset.payments.length : 0,
      submissions: Array.isArray(dataset.submissions) ? dataset.submissions.length : 0,
      exportedAt: dataset.exportedAt || "Unknown",
    };

    if (!confirm) {
      return NextResponse.json({
        success: true,
        mode: "PREVIEW",
        preview,
        message: "Dataset validated. Confirm import to write records to database.",
      });
    }

    // 2. Perform safe selective upsert on confirmed import
    let importedHackathons = 0;
    if (Array.isArray(dataset.hackathons)) {
      for (const h of dataset.hackathons) {
        if (!h.slug || !h.name) continue;
        await prisma.hackathon.upsert({
          where: { slug: h.slug },
          update: {
            name: h.name,
            tagline: h.tagline,
            description: h.description,
            registrationFee: Number(h.registrationFee) || 0,
            currency: h.currency || "INR",
          },
          create: {
            slug: h.slug,
            name: h.name,
            tagline: h.tagline || "",
            description: h.description || "",
            registrationFee: Number(h.registrationFee) || 0,
            currency: h.currency || "INR",
            minTeamSize: Number(h.minTeamSize) || 2,
            maxTeamSize: Number(h.maxTeamSize) || 4,
            registrationStartDate: new Date(h.registrationStartDate || Date.now()),
            registrationDeadline: new Date(h.registrationDeadline || Date.now() + 15 * 86400000),
            hackathonStartDate: new Date(h.hackathonStartDate || Date.now() + 20 * 86400000),
            hackathonEndDate: new Date(h.hackathonEndDate || Date.now() + 22 * 86400000),
            submissionDeadline: new Date(h.submissionDeadline || Date.now() + 21 * 86400000),
            status: h.status || "REGISTRATION_OPEN",
          },
        });
        importedHackathons++;
      }
    }

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "DATA_IMPORTED",
      entity: "Platform",
      metadata: { preview, importedHackathons },
    });

    return NextResponse.json({
      success: true,
      mode: "IMPORTED",
      importedCounts: {
        hackathons: importedHackathons,
      },
      message: "Data import completed successfully.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import dataset" }, { status: 500 });
  }
}
