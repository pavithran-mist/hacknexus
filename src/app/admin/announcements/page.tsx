import { prisma } from "@/lib/prisma";
import AnnouncementsManager from "./AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const [announcements, hackathons] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { hackathon: { select: { id: true, name: true } } },
    }),
    prisma.hackathon.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Broadcasts & Announcements</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Send high-priority notifications and alerts directly to participant and judge dashboards.
        </p>
      </div>

      <AnnouncementsManager
        initialAnnouncements={announcements}
        hackathons={hackathons}
      />
    </div>
  );
}
