"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  ExternalLink,
  Medal,
  Star,
  Users,
} from "lucide-react";

interface SubRecord {
  id: string;
  submissionNumber: string;
  projectTitle: string;
  teamName: string;
  college: string;
  themeName: string;
  problemCode: string;
  rank: number | null;
  award: string | null;
  isWinner: boolean;
  certificateIssued: boolean;
  certificateId: string | null;
  scoresCount: number;
  averageScore: number;
  membersCount: number;
  status: string;
}

interface ResultsProps {
  initialSubmissions: SubRecord[];
  initialHackathon: { id?: string; name?: string; resultsPublished: boolean };
}

const AWARD_OPTIONS = [
  "None",
  "Grand Champion (1st Place)",
  "1st Runner Up (2nd Place)",
  "2nd Runner Up (3rd Place)",
  "Best AI / ML Innovation",
  "Best UI / UX Experience",
  "Best High-Impact Prototype",
  "Special Jury Recognition",
  "Finalist of Excellence",
];

export default function ResultsManagerClient({
  initialSubmissions,
  initialHackathon,
}: ResultsProps) {
  const [submissions, setSubmissions] = useState<SubRecord[]>(initialSubmissions);
  const [resultsPublished, setResultsPublished] = useState(
    initialHackathon.resultsPublished
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRankChange = (id: string, rank: string) => {
    const num = rank ? parseInt(rank, 10) : null;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rank: num, isWinner: !!num && num <= 3 } : s))
    );
  };

  const handleAwardChange = (id: string, award: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              award: award === "None" ? null : award,
              isWinner: award.includes("Champion") || award.includes("Runner Up"),
            }
          : s
      )
    );
  };

  const handleSaveRanks = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = submissions.map((s) => ({
        id: s.id,
        rank: s.rank,
        award: s.award,
        isWinner: s.isWinner,
      }));

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_RANKS", rankings: payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save rankings");

      setMessage("Rankings and awards saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save rankings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (
      !confirm(
        "Are you sure you want to publish the official hackathon results? This will issue certificates to all teams and notify participants on their main dashboard."
      )
    ) {
      return;
    }

    setPublishing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PUBLISH_RESULTS" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish results");

      setResultsPublished(true);
      setMessage(
        "🎉 Official Results Published and Verified Certificates Issued! All participant dashboards are updated."
      );

      // Refresh list to show newly generated certificate IDs
      const ref = await fetch("/api/admin/results");
      const refData = await ref.json();
      if (refData.submissions) {
        setSubmissions(refData.submissions);
      }
    } catch (err: any) {
      setError(err.message || "Failed to publish results.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" /> Jury & Awards Portal
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hackathon Results & Certificate Issuance
          </h1>
          <p className="text-xs text-muted-foreground">
            Assign podium ranks, honorary titles, and publish verified digital certificates directly to all participant dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleSaveRanks}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-muted-foreground" />
            <span>{saving ? "Saving..." : "Save Rankings"}</span>
          </button>

          <button
            onClick={handlePublishResults}
            disabled={publishing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
              resultsPublished
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {publishing
                ? "Publishing..."
                : resultsPublished
                ? "Re-Publish / Update Certificates"
                : "Publish Results & Issue Certificates"}
            </span>
          </button>
        </div>
      </div>

      {resultsPublished && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">
              Live Status: Hackathon Results are Published! Participants can view awards and print certificates from their dashboards.
            </span>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submissions Evaluation & Rankings Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]/50">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Medal className="w-4 h-4 text-red-500" />
            Final Submissions & Jury Leaderboard ({submissions.length})
          </span>
          <span className="text-[11px] text-muted-foreground">
            Sorted by Judge Average Score
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-muted-foreground uppercase font-semibold border-b border-[#30363D]">
              <tr>
                <th className="py-3 px-4">Podium Rank</th>
                <th className="py-3 px-4">Team & College</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4 text-center">Jury Avg</th>
                <th className="py-3 px-4">Assigned Award</th>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {submissions.map((sub, idx) => (
                <tr
                  key={sub.id}
                  className={`hover:bg-[#1F242C]/50 transition-colors ${
                    sub.rank === 1
                      ? "bg-amber-500/5"
                      : sub.rank === 2
                      ? "bg-slate-300/5"
                      : sub.rank === 3
                      ? "bg-amber-700/5"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={sub.rank || ""}
                        onChange={(e) => handleRankChange(sub.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-white font-bold font-mono text-xs focus:outline-none focus:border-red-500"
                      >
                        <option value="">Unranked</option>
                        <option value="1">🥇 Rank 1 (Winner)</option>
                        <option value="2">🥈 Rank 2 (1st Runner)</option>
                        <option value="3">🥉 Rank 3 (2nd Runner)</option>
                        <option value="4">Rank 4</option>
                        <option value="5">Rank 5</option>
                      </select>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{sub.teamName}</div>
                    <div className="text-[11px] text-muted-foreground">{sub.college}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-white max-w-xs truncate">
                      {sub.projectTitle}
                    </div>
                    <div className="text-[10px] text-teal-400 font-mono">
                      {sub.submissionNumber} • {sub.themeName}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{sub.averageScore > 0 ? `${sub.averageScore}/100` : "Pending"}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={sub.award || "None"}
                      onChange={(e) => handleAwardChange(sub.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-white text-xs focus:outline-none focus:border-red-500 max-w-[200px]"
                    >
                      {AWARD_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    {sub.certificateId ? (
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {sub.certificateId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        Generated on publish
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {sub.certificateId ? (
                      <Link
                        href={`/certificate/${sub.certificateId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-white text-[11px] font-semibold border border-[#30363D]"
                      >
                        <ExternalLink className="w-3 h-3 text-red-400" />
                        <span>View Certificate</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
