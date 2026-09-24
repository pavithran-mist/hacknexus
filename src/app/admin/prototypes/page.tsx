import { prisma } from "@/lib/prisma";
import PrototypesManager from "./PrototypesManager";

export const dynamic = "force-dynamic";

export default async function AdminPrototypesPage() {
  const prototypes = await prisma.prototype.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      team: {
        include: {
          leader: true,
          theme: true,
          problem: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Prototype Deliverable Reviews</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Evaluate submitted repository links, live demos, and update review statuses (APPROVED, NEEDS_CHANGES, etc.).
        </p>
      </div>

      <PrototypesManager initialPrototypes={prototypes} />
    </div>
  );
}
