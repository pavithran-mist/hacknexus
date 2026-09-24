"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Video,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  Layers,
  Building,
  Save,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

interface Criterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface JudgeEvaluationClientProps {
  assignments: any[];
  criteria: Criterion[];
  judgeId: string;
}

export default function JudgeEvaluationClient({
  assignments,
  criteria,
  judgeId,
}: JudgeEvaluationClientProps) {
  const router = useRouter();
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);

  const activeAssignment = assignments[selectedAssignmentIndex];

  // Initialize scores state from existing scores
  const [scoresMap, setScoresMap] = useState<Record<string, { score: number; feedback: string }>>(() => {
    const initial: Record<string, { score: number; feedback: string }> = {};
    if (activeAssignment?.scores) {
      for (const s of activeAssignment.scores) {
        initial[s.criterionId] = { score: s.score, feedback: s.feedback || "" };
      }
    }
    return initial;
  });

  const [overallFeedback, setOverallFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleScoreChange = (criterionId: string, value: number) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: value,
        feedback: prev[criterionId]?.feedback || "",
      },
    }));
  };

  const handleFeedbackChange = (criterionId: string, feedback: string) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: prev[criterionId]?.score || 0,
        feedback,
      },
    }));
  };

  // Compute total score
  const totalScore = criteria.reduce((sum, c) => {
    return sum + (scoresMap[c.id]?.score || 0);
  }, 0);

  const totalMaxScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  const handleSubmitEvaluation = async () => {
    if (!activeAssignment) return;
    setError("");
    setSaving(true);
    setSaveSuccess(false);

    try {
      const formattedScores = criteria.map((c) => ({
        criterionId: c.id,
        score: scoresMap[c.id]?.score || 0,
        feedback: scoresMap[c.id]?.feedback || "",
      }));

      const res = await fetch("/api/judge/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: activeAssignment.id,
          submissionId: activeAssignment.submission.id,
          scores: formattedScores,
          feedback: overallFeedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record evaluation");
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (!activeAssignment) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-xs text-muted-foreground">
        No submissions are currently assigned to your evaluation queue.
      </div>
    );
  }

  const sub = activeAssignment.submission;
  const team = sub.team;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Col: Queue of Assigned Teams */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Assigned Submissions ({assignments.length})
        </h3>

        <div className="space-y-2">
          {assignments.map((assign, idx) => (
            <div
              key={assign.id}
              onClick={() => {
                setSelectedAssignmentIndex(idx);
                setSaveSuccess(false);
                setError("");
                // Re-hydrate scores
                const loaded: Record<string, { score: number; feedback: string }> = {};
                if (assign.scores) {
                  for (const s of assign.scores) {
                    loaded[s.criterionId] = { score: s.score, feedback: s.feedback || "" };
                  }
                }
                setScoresMap(loaded);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${
                selectedAssignmentIndex === idx
                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                  : "bg-card border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-teal-400 font-bold">
                  {assign.submission.submissionNumber}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    assign.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {assign.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">
                {assign.submission.projectTitle}
              </h4>
              <p className="text-xs text-muted-foreground">
                Team: {assign.submission.team.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Middle & Right: Active Submission Review & Rubric Scoring */}
      <div className="lg:col-span-2 space-y-6">
        {/* Project Overview Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
            <span className="font-mono text-xs font-bold text-primary">
              ID: {sub.submissionNumber}
            </span>
            <span className="text-xs text-muted-foreground">
              Submitted: {new Date(sub.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">{sub.projectTitle}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="text-white font-semibold">Team: {team.name}</span>
              <span>•</span>
              <span>{team.college}</span>
              <span>•</span>
              <span className="text-teal-400">Track: {team.theme?.name}</span>
            </div>
          </div>

          {/* Deliverables Action Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            {sub.prototypeUrl && (
              <a
                href={sub.prototypeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-xs font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" /> Prototype Live
              </a>
            )}
            {sub.githubUrl && (
              <a
                href={sub.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-xs font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
              >
                <GithubIcon className="w-3.5 h-3.5 text-blue-400" /> Repository
              </a>
            )}
            {sub.demoVideoUrl && (
              <a
                href={sub.demoVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-xs font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-rose-400" /> Demo Video
              </a>
            )}
            {sub.pptUrl && (
              <a
                href={sub.pptUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-xs font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Slide Deck
              </a>
            )}
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                Solution Description
              </span>
              <p className="text-foreground/90 mt-1 leading-relaxed whitespace-pre-line">
                {sub.projectDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#111827] p-3 rounded-lg border border-border">
                <span className="font-bold text-[10px] uppercase text-teal-400 block">Expected Impact</span>
                <p className="text-muted-foreground mt-1">{sub.expectedImpact}</p>
              </div>
              <div className="bg-[#111827] p-3 rounded-lg border border-border">
                <span className="font-bold text-[10px] uppercase text-blue-400 block">Future Scope</span>
                <p className="text-muted-foreground mt-1">{sub.futureScope}</p>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {sub.technologies.split(",").map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] bg-[#111827] border border-border px-2 py-0.5 rounded text-muted-foreground"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Rubric Scoring Form */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" /> Evaluation Rubric
              </h3>
              <p className="text-xs text-muted-foreground">
                Grade the solution across official hackathon evaluation dimensions.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Total Score
              </span>
              <span className="font-mono text-xl font-extrabold text-teal-400">
                {totalScore} / {totalMaxScore}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Evaluation saved successfully to the database!</span>
            </div>
          )}

          <div className="space-y-5">
            {criteria.map((c) => {
              const currentScore = scoresMap[c.id]?.score || 0;
              return (
                <div
                  key={c.id}
                  className="bg-[#111827] border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{c.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={c.maxScore}
                        value={currentScore}
                        onChange={(e) => handleScoreChange(c.id, Number(e.target.value))}
                        className="w-16 bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-teal-400 focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        / {c.maxScore}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={c.maxScore}
                    value={currentScore}
                    onChange={(e) => handleScoreChange(c.id, Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-border rounded-lg cursor-pointer"
                  />

                  <input
                    type="text"
                    placeholder={`Notes on ${c.name.toLowerCase()} (optional)...`}
                    value={scoresMap[c.id]?.feedback || ""}
                    onChange={(e) => handleFeedbackChange(c.id, e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1 font-medium">
              Overall Jury Feedback & Recommendation
            </label>
            <textarea
              rows={3}
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Constructive feedback for the team..."
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitEvaluation}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Scores..." : "Submit Official Evaluation"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
