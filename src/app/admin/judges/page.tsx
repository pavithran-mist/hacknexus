import { prisma } from "@/lib/prisma";
import JudgesManager from "./JudgesManager";

export const dynamic = "force-dynamic";

export default async function AdminJudgesPage() {
  const [judges, hackathons, submissions] = await Promise.all([
    prisma.judge.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        hackathon: true,
        assignments: {
          include: {
            submission: { include: { team: true } },
            scores: true,
          },
        },
      },
    }),
    prisma.hackathon.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.findMany({
      select: { id: true, submissionNumber: true, projectTitle: true, hackathonId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Jury & Evaluator Management</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Recruit expert judges, review credentials, assign project queues, and track scoring progress.
        </p>
      </div>

      <JudgesManager
        initialJudges={judges}
        hackathons={hackathons}
        submissions={submissions}
      />
    </div>
  );
}
