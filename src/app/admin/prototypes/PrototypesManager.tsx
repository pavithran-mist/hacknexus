"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Video,
  CheckCircle2,
  AlertCircle,
  Edit2,
  X,
  Search,
  Code2,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";
import { formatDate } from "@/lib/utils";

export default function PrototypesManager({ initialPrototypes }: { initialPrototypes: any[] }) {
  const router = useRouter();
  const [prototypes, setPrototypes] = useState(initialPrototypes);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editingPrototype, setEditingPrototype] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("APPROVED");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openStatusModal = (p: any) => {
    setEditingPrototype(p);
    setNewStatus(p.status);
    setFeedback(p.feedback || "");
    setError("");
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrototype) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/prototypes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prototypeId: editingPrototype.id,
          status: newStatus,
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        setSubmitting(false);
        return;
      }

      setMessage(`Prototype for "${editingPrototype.team?.name}" updated to ${newStatus}. Notification sent to team leader.`);
      setEditingPrototype(null);
      router.refresh();

      // Refresh prototypes list
      const updated = await fetch("/api/admin/prototypes").then((r) => r.json());
      if (updated.prototypes) setPrototypes(updated.prototypes);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = prototypes.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      p.team?.name.toLowerCase().includes(s) ||
      p.projectDescription.toLowerCase().includes(s) ||
      p.prototypeUrl.toLowerCase().includes(s);
    const matchesStatus = filterStatus === "" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team or prototype URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111827] border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Review Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="NEEDS_CHANGES">NEEDS_CHANGES</option>
          </select>
        </div>
      </div>

      {/* Prototypes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-2xl p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{p.team?.name}</h3>
                  <span className="text-[11px] text-muted-foreground">
                    Track: {p.team?.theme?.name} • Challenge: {p.team?.problem?.problemCode}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                    p.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : p.status === "NEEDS_CHANGES"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {p.projectDescription}
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-2 pt-2">
                {p.prototypeUrl && (
                  <a
                    href={p.prototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-primary" /> Live Demo
                  </a>
                )}
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                  >
                    <GithubIcon className="w-3.5 h-3.5 text-blue-400" /> GitHub
                  </a>
                )}
                {p.videoUrl && (
                  <a
                    href={p.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-[11px] font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-rose-400" /> Video
                  </a>
                )}
              </div>

              {p.feedback && (
                <div className="p-3 rounded-lg bg-[#111827] border border-border text-[11px] text-muted-foreground">
                  <strong className="text-white block mb-0.5">Admin / Mentor Feedback:</strong>
                  {p.feedback}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px] font-mono">
                Updated: {formatDate(p.updatedAt)}
              </span>
              <button
                onClick={() => openStatusModal(p)}
                className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted/40 border border-border text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" /> Update Review Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Review Status Modal */}
      {editingPrototype && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">
                Review Status: {editingPrototype.team?.name}
              </h3>
              <button onClick={() => setEditingPrototype(null)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Review Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="NEEDS_CHANGES">NEEDS_CHANGES</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Feedback & Advisory</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Notes for the team on architecture, API latency, or demo corrections..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPrototype(null)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
