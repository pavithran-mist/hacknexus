import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get("hackathonId");

    const content = await prisma.websiteContent.findFirst({
      where: hackathonId ? { hackathonId } : undefined,
    });

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const {
      hackathonId,
      heroTitle,
      heroSubtitle,
      aboutText,
      rulesText,
      faqJson,
      contactEmail,
      contactPhone,
      footerText,
      socialLinksJson,
    } = body;

    if (!hackathonId) {
      return NextResponse.json({ error: "Hackathon ID required" }, { status: 400 });
    }

    const content = await prisma.websiteContent.upsert({
      where: { hackathonId },
      update: {
        heroTitle,
        heroSubtitle,
        aboutText,
        rulesText,
        faqJson,
        contactEmail,
        contactPhone,
        footerText,
        socialLinksJson,
      },
      create: {
        hackathonId,
        heroTitle: heroTitle || "Turn Your Ideas Into Innovation",
        heroSubtitle: heroSubtitle || "Build bold solutions. Collaborate with brilliant teams.",
        aboutText,
        rulesText,
        faqJson,
        contactEmail,
        contactPhone,
        footerText,
        socialLinksJson,
      },
    });

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "CMS_CONTENT_UPDATED",
      entity: "WebsiteContent",
      entityId: content.id,
    });

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update CMS content" }, { status: 500 });
  }
}
