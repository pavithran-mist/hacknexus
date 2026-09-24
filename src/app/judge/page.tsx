import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Award, CheckCircle2, Clock, Layers, Star } from "lucide-react";
import JudgeEvaluationClient from "./JudgeEvaluationClient";

export const dynamic = "force-dynamic";

export default async function JudgeDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/judge");
  }

  // Find judge profile
  let judge = await prisma.judge.findFirst({
    where: { userId: user.id },
    include: {
      hackathon: {
        include: {
          evaluationCriteria: { orderBy: { name: "asc" } },
        },
      },
      assignments: {
        include: {
          submission: {
            include: {
              team: {
                include: {
                  leader: true,
                  theme: true,
                  problem: true,
                  members: true,
                },
              },
            },
          },
          scores: {
            include: { criterion: true },
          },
        },
      },
    },
  });

  // If user is Admin or Super Admin without a judge profile, look up any active hackathon to let them test judging
  if (!judge && (user.role === "SUPER_ADMIN" || user.role === "ADMIN")) {
    const hackathon = await prisma.hackathon.findFirst({
      include: { evaluationCriteria: true },
    });
    if (hackathon) {
      // Find all submissions in this hackathon
      const allSubmissions = await prisma.submission.findMany({
        where: { hackathonId: hackathon.id },
        include: {
          team: {
            include: {
              leader: true,
              theme: true,
              problem: true,
              members: true,
            },
          },
          judgeAssignments: {
            include: { scores: { include: { criterion: true } } },
          },
        },
      });

      // Construct a simulated judge view for testing admin evaluation
      const assignments = allSubmissions.map((sub) => ({
        id: sub.judgeAssignments[0]?.id || `sim_assign_${sub.id}`,
        judgeId: `admin_${user.id}`,
        submissionId: sub.id,
        status: sub.judgeAssignments[0]?.status || "ASSIGNED",
        submission: sub,
        scores: sub.judgeAssignments[0]?.scores || [],
      }));

      judge = {
        id: `admin_judge_${user.id}`,
        userId: user.id,
        hackathonId: hackathon.id,
        designation: "Administrator / Acting Jury Chair",
        company: "HackNexus",
        expertise: "Full Spectrum System Architecture",
        bio: "Platform Administrator with override evaluation privileges.",
        hackathon,
        assignments: assignments as any,
      } as any;
    }
  }

  if (!judge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Award className="w-12 h-12 text-amber-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white">No Judge Profile Found</h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your account is not assigned as an active jury evaluator for any hackathon. Contact the hackathon administrator.
        </p>
      </div>
    );
  }

  const assignments = judge.assignments || [];
  const completedCount = assignments.filter((a) => a.status === "COMPLETED").length;
  const pendingCount = assignments.length - completedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Jury Evaluation Panel
            </span>
            <span className="text-xs text-muted-foreground">{judge.hackathon.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {judge.designation} at <strong className="text-white">{judge.company}</strong> • Specialization: {judge.expertise}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#111827] border border-border p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-base font-extrabold text-white block">{assignments.length}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Assigned</span>
          </div>
          <div className="bg-[#111827] border border-border p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-base font-extrabold text-amber-400 block">{pendingCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">In Progress</span>
          </div>
          <div className="bg-[#111827] border border-border p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-base font-extrabold text-emerald-400 block">{completedCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Evaluated</span>
          </div>
        </div>
      </div>

      {/* Assigned Submissions & Scoring View */}
      <JudgeEvaluationClient
        assignments={assignments}
        criteria={judge.hackathon.evaluationCriteria}
        judgeId={judge.id}
      />
    </div>
  );
}
