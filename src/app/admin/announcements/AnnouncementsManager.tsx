"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Bell, CheckCircle2, AlertCircle, X, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AnnouncementsManager({
  initialAnnouncements,
  hackathons,
}: {
  initialAnnouncements: any[];
  hackathons: any[];
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "");
  const [title, setTitle] = useState("");
  const [message, setMessageText] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [targetAudience, setTargetAudience] = useState("EVERYONE");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          title,
          message,
          priority,
          targetAudience,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Broadcast creation failed");
        setSubmitting(false);
        return;
      }

      setSuccess(`Announcement "${title}" broadcasted to ${targetAudience}!`);
      setModalOpen(false);
      setTitle("");
      setMessageText("");
      router.refresh();

      // Refresh list
      const updated = await fetch("/api/admin/announcements").then((r) => r.json());
      if (updated.announcements) setAnnouncements(updated.announcements);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            setModalOpen(true);
            setError("");
          }}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-card border border-border rounded-xl p-5 space-y-2 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    ann.priority === "URGENT"
                      ? "bg-danger/20 text-rose-400 border border-danger/30"
                      : ann.priority === "HIGH"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-primary/20 text-teal-300 border border-primary/30"
                  }`}
                >
                  {ann.priority}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-[#111827] px-2 py-0.5 rounded">
                  Audience: {ann.targetAudience}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {formatDate(ann.createdAt)}
              </span>
            </div>

            <h3 className="font-bold text-base text-white">{ann.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{ann.message}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">Broadcast Announcement</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Hackathon Edition *</label>
                <select
                  value={hackathonId}
                  onChange={(e) => setHackathonId(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Code Freeze Reminder & Final Submission Open"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="State the broadcast instructions clearly..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="EVERYONE">EVERYONE</option>
                    <option value="PARTICIPANTS">PARTICIPANTS</option>
                    <option value="JUDGES">JUDGES</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Broadcasting..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
