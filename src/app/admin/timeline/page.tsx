import { prisma } from "@/lib/prisma";
import TimelineManager from "./TimelineManager";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const [events, hackathons] = await Promise.all([
    prisma.timelineEvent.findMany({
      orderBy: { order: "asc" },
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
        <h1 className="text-2xl font-extrabold text-white">Competition Roadmap & Timeline</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Schedule and order competition milestones, milestones statuses, and public timeline displays.
        </p>
      </div>

      <TimelineManager initialEvents={events} hackathons={hackathons} />
    </div>
  );
}
