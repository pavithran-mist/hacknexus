import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Building,
  Layers,
  CheckCircle,
  FileCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProblemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const problem = await prisma.problemStatement.findUnique({
    where: { id: params.id },
    include: {
      theme: true,
      hackathon: true,
      _count: { select: { teams: true } },
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Problem Statements
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold px-3 py-1 rounded bg-[#111827] text-primary border border-border">
              {problem.problemCode}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                problem.difficulty === "HARD"
                  ? "bg-danger/20 text-rose-400 border border-danger/30"
                  : problem.difficulty === "MEDIUM"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-bold text-white">{problem._count.teams}</span> teams currently tackling this challenge
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {problem.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-white">
              <Building className="w-4 h-4 text-primary" /> Sponsored by {problem.organization}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" /> Track: {problem.theme.name}
            </span>
            <span>•</span>
            <span>{problem.hackathon.name}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Registration Fee:{" "}
            <strong className="text-white">
              ₹{problem.hackathon.registrationFee}
            </strong>{" "}
            per team
          </div>
          <Link
            href={`/register-team?problemId=${problem.id}&themeId=${problem.themeId}&hackathonId=${problem.hackathonId}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Register With This Problem</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Challenge Description */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Challenge Background & Overview
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>
          </div>

          {/* Technical Requirements */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Key Specifications & Requirements
            </h3>
            <div className="text-sm text-foreground/90 leading-relaxed bg-[#111827] p-4 rounded-lg border border-border/80 whitespace-pre-line">
              {problem.requirements}
            </div>
          </div>

          {/* Expected Output */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Expected Deliverables & Evaluation Benchmark
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {problem.expectedOutput}
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Tech Stack */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-primary" /> Recommended Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {problem.technologies.split(",").map((tech, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#111827] border border-border px-2.5 py-1 rounded text-teal-300 font-mono font-medium"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Registration Box */}
          <div className="bg-[#1A2536] border border-primary/30 rounded-xl p-5 space-y-4 text-center">
            <h4 className="text-sm font-bold text-white">Assemble Your Team</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Team size is {problem.hackathon.minTeamSize}–{problem.hackathon.maxTeamSize} members. You can submit initial prototype links during registration.
            </p>
            <Link
              href={`/register-team?problemId=${problem.id}&themeId=${problem.themeId}&hackathonId=${problem.hackathonId}`}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Begin Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
