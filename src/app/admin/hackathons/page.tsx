import { prisma } from "@/lib/prisma";
import HackathonsManager from "./HackathonsManager";

export const dynamic = "force-dynamic";

export default async function AdminHackathonsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Hackathon Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure multi-hackathon editions, adjust registration fees (e.g. ₹499 → ₹799), and manage deadlines.
          </p>
        </div>
      </div>

      <HackathonsManager initialHackathons={hackathons} />
    </div>
  );
}
