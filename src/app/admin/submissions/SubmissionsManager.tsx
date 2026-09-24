"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ExternalLink,
  Video,
  FileText,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  Users,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";
import { formatDate } from "@/lib/utils";

export default function SubmissionsManager({
  initialSubmissions,
  judges,
}: {
  initialSubmissions: any[];
  judges: any[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [assigningSubmission, setAssigningSubmission] = useState<any | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState(judges[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAssignJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubmission || !selectedJudgeId) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/judges/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgeId: selectedJudgeId,
          submissionId: assigningSubmission.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Assignment failed");
        setSubmitting(false);
        return;
      }

      setMessage("Judge assigned successfully!");
      setAssigningSubmission(null);
      router.refresh();

      // Refresh list
      const updated = await fetch("/api/admin/submissions").then((r) => r.json());
      if (updated.submissions) setSubmissions(updated.submissions);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-xs text-muted-foreground">
          No final submissions recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub) => {
            const totalScore = sub.judgeAssignments?.reduce((acc: number, ja: any) => {
              const jaScore = ja.scores?.reduce((sAcc: number, sc: any) => sAcc + sc.score, 0) || 0;
              return acc + jaScore;
            }, 0) || 0;

            return (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#111827] text-teal-400 border border-border">
                      {sub.submissionNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Submitted by <strong className="text-white">{sub.team?.name}</strong> • {sub.team?.college}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {totalScore > 0 && (
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> Jury Score: {totalScore} pts
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setAssigningSubmission(sub);
                        setError("");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Assign Judge
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{sub.projectTitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {sub.projectDescription}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {sub.prototypeUrl && (
                    <a
                      href={sub.prototypeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3 text-primary" /> Prototype Live
                    </a>
                  )}
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                    >
                      <GithubIcon className="w-3 h-3 text-blue-400" /> Repository
                    </a>
                  )}
                  {sub.demoVideoUrl && (
                    <a
                      href={sub.demoVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                    >
                      <Video className="w-3 h-3 text-rose-400" /> Demo Video
                    </a>
                  )}
                  {sub.pptUrl && (
                    <a
                      href={sub.pptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3 text-amber-400" /> Presentation
                    </a>
                  )}
                </div>

                {/* Assigned Judges List */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-muted-foreground font-bold text-[10px] uppercase">
                    Assigned Evaluators:
                  </span>
                  {sub.judgeAssignments?.length === 0 ? (
                    <span className="text-muted-foreground italic">None assigned yet</span>
                  ) : (
                    sub.judgeAssignments.map((ja: any) => (
                      <span
                        key={ja.id}
                        className="bg-[#111827] border border-border px-2.5 py-1 rounded-lg text-white font-medium flex items-center gap-1.5"
                      >
                        <span>{ja.judge?.user?.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            ja.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {ja.status}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Judge Modal */}
      {assigningSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">
                Assign Evaluator to Project
              </h3>
              <button onClick={() => setAssigningSubmission(null)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#111827] border border-border text-xs space-y-1">
              <p><strong className="text-white">Project:</strong> {assigningSubmission.projectTitle}</p>
              <p><strong className="text-white">Squad:</strong> {assigningSubmission.team?.name}</p>
              <p><strong className="text-white">Submission:</strong> {assigningSubmission.submissionNumber}</p>
            </div>

            <form onSubmit={handleAssignJudge} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Select Judge *</label>
                <select
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {judges.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.user?.name} ({j.company} • {j.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssigningSubmission(null)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
