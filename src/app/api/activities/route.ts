import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check system settings
    const popupSetting = await prisma.systemSetting.findUnique({
      where: { key: "activity_popup_enabled" },
    });
    const showDemoSetting = await prisma.systemSetting.findUnique({
      where: { key: "show_demo_activity" },
    });

    const isEnabled = popupSetting?.value !== "false";
    const showDemo = showDemoSetting?.value !== "false";

    if (!isEnabled) {
      return NextResponse.json({ activities: [], enabled: false });
    }

    const whereClause: any = {};
    if (!showDemo) {
      whereClause.isDemo = false;
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    return NextResponse.json({
      activities,
      enabled: isEnabled,
      showDemo,
    });
  } catch (error) {
    console.error("Activity fetch error:", error);
    return NextResponse.json({ activities: [], enabled: false });
  }
}
