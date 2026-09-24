import { prisma } from "@/lib/prisma";
import ThemesManager from "./ThemesManager";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const [themes, hackathons] = await Promise.all([
    prisma.theme.findMany({
      orderBy: { order: "asc" },
      include: {
        hackathon: { select: { id: true, name: true } },
        _count: { select: { problems: true, teams: true } },
      },
    }),
    prisma.hackathon.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Themes & Tracks</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Create, edit, reorder, and activate/deactivate domain tracks across hackathons.
        </p>
      </div>

      <ThemesManager initialThemes={themes} hackathons={hackathons} />
    </div>
  );
}
