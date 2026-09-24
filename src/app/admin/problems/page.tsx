import { prisma } from "@/lib/prisma";
import ProblemsManager from "./ProblemsManager";

export const dynamic = "force-dynamic";

export default async function AdminProblemsPage() {
  const [problems, themes, hackathons] = await Promise.all([
    prisma.problemStatement.findMany({
      orderBy: { problemCode: "asc" },
      include: {
        theme: { select: { id: true, name: true } },
        hackathon: { select: { id: true, name: true } },
        _count: { select: { teams: true } },
      },
    }),
    prisma.theme.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, hackathonId: true },
    }),
    prisma.hackathon.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Problem Statements</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Create, edit, duplicate, activate/deactivate, and manage official hackathon challenges.
        </p>
      </div>

      <ProblemsManager
        initialProblems={problems}
        themes={themes}
        hackathons={hackathons}
      />
    </div>
  );
}
