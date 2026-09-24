import { prisma } from "@/lib/prisma";
import SubmissionsManager from "./SubmissionsManager";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const [submissions, judges] = await Promise.all([
    prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        team: {
          include: {
            leader: true,
            theme: true,
            problem: true,
            members: true,
          },
        },
        hackathon: true,
        judgeAssignments: {
          include: {
            judge: { include: { user: true } },
            scores: { include: { criterion: true } },
          },
        },
        scores: { include: { criterion: true } },
      },
    }),
    prisma.judge.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        hackathon: { select: { id: true, name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Final Project Submissions</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inspect final deliverables, slide decks, assign evaluators, and monitor jury grading progress.
        </p>
      </div>

      <SubmissionsManager initialSubmissions={submissions} judges={judges} />
    </div>
  );
}
