"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, CheckCircle2, AlertCircle, X, Clock } from "lucide-react";

export default function TimelineManager({
  initialEvents,
  hackathons,
}: {
  initialEvents: any[];
  hackathons: any[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("Nov 05, 2026");
  const [time, setTime] = useState("10:00 AM IST");
  const [order, setOrder] = useState<number>(events.length + 1);
  const [status, setStatus] = useState("UPCOMING");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          title,
          description,
          date,
          time,
          order,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Event creation failed");
        setSubmitting(false);
        return;
      }

      setSuccess(`Timeline event "${title}" added!`);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      router.refresh();

      // Refresh list
      const updated = await fetch("/api/admin/timeline").then((r) => r.json());
      if (updated.events) setEvents(updated.events);
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
          <Plus className="w-4 h-4" /> Add Timeline Milestone
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Event Milestone</th>
                <th className="p-3.5">Scheduled Date & Time</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono text-muted-foreground font-bold">
                    #{ev.order}
                  </td>
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    {ev.title}
                  </td>
                  <td className="p-3.5 font-mono text-teal-300">
                    {ev.date} {ev.time && `• ${ev.time}`}
                  </td>
                  <td className="p-3.5 text-muted-foreground max-w-sm truncate">{ev.description}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ev.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : ev.status === "ACTIVE"
                          ? "bg-primary/20 text-teal-300 border border-primary/30"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">Add Timeline Milestone</h3>
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
                <label className="text-muted-foreground block mb-1 font-medium">Hackathon *</label>
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
                <label className="text-muted-foreground block mb-1 font-medium">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Point Mentorship Review"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe expectations for this milestone..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Date (Display String)</label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Nov 06, 2026"
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Time (Optional)</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="02:00 PM IST"
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
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
                  {submitting ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
