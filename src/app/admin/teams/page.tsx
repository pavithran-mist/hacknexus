import { prisma } from "@/lib/prisma";
import TeamsManager from "./TeamsManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const [teams, themes, problems] = await Promise.all([
    prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        leader: true,
        theme: true,
        problem: true,
        members: true,
        registration: true,
        payments: true,
        prototype: true,
        submission: true,
      },
    }),
    prisma.theme.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true } }),
    prisma.problemStatement.findMany({ where: { status: "ACTIVE" }, select: { id: true, problemCode: true, title: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Squad & Team Operations</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Monitor team rosters, registration statuses, fee payment confirmations, and review deliverables.
        </p>
      </div>

      <TeamsManager initialTeams={teams} themes={themes} problems={problems} />
    </div>
  );
}
