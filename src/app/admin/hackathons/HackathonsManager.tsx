"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trophy, CheckCircle, AlertCircle, X, IndianRupee } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function HackathonsManager({ initialHackathons }: { initialHackathons: any[] }) {
  const router = useRouter();
  const [hackathons, setHackathons] = useState(initialHackathons);
  const [editingHackathon, setEditingHackathon] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [registrationFee, setRegistrationFee] = useState<number>(499);
  const [minTeamSize, setMinTeamSize] = useState<number>(2);
  const [maxTeamSize, setMaxTeamSize] = useState<number>(4);
  const [status, setStatus] = useState("REGISTRATION_OPEN");

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingHackathon(null);
    setName("");
    setSlug("");
    setTagline("");
    setDescription("");
    setRegistrationFee(499);
    setMinTeamSize(2);
    setMaxTeamSize(4);
    setStatus("REGISTRATION_OPEN");
    setError("");
  };

  const openEditModal = (h: any) => {
    setEditingHackathon(h);
    setIsCreating(false);
    setName(h.name);
    setSlug(h.slug);
    setTagline(h.tagline);
    setDescription(h.description);
    setRegistrationFee(h.registrationFee);
    setMinTeamSize(h.minTeamSize);
    setMaxTeamSize(h.maxTeamSize);
    setStatus(h.status);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (isCreating) {
        const res = await fetch("/api/admin/hackathons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            tagline,
            description,
            registrationFee,
            minTeamSize,
            maxTeamSize,
            status,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create hackathon");
          setSubmitting(false);
          return;
        }
        setMessage(`Hackathon "${name}" created successfully!`);
      } else if (editingHackathon) {
        const res = await fetch(`/api/admin/hackathons/${editingHackathon.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            tagline,
            description,
            registrationFee,
            minTeamSize,
            maxTeamSize,
            status,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to update hackathon");
          setSubmitting(false);
          return;
        }
        setMessage(`Hackathon updated successfully! Registration fee set to ₹${registrationFee}.`);
      }

      setEditingHackathon(null);
      setIsCreating(false);
      router.refresh();

      // Refresh local list
      const updatedList = await fetch("/api/admin/hackathons").then((r) => r.json());
      if (updatedList.hackathons) setHackathons(updatedList.hackathons);
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
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create New Hackathon
        </button>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hackathons.map((h) => (
          <div
            key={h.id}
            className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-teal-300 border border-primary/30">
                {h.status}
              </span>
              <button
                onClick={() => openEditModal(h)}
                className="text-xs text-primary hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Settings
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{h.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{h.tagline}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-border text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Registration Fee
                </span>
                <span className="text-base font-extrabold text-teal-400">
                  {formatCurrency(h.registrationFee, h.currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Team Size Limits
                </span>
                <span className="text-sm font-bold text-white">
                  {h.minTeamSize} – {h.maxTeamSize} Members
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Registered Squads
                </span>
                <span className="text-sm font-bold text-white">{h._count?.teams || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Active Challenges
                </span>
                <span className="text-sm font-bold text-white">{h._count?.problems || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Slug: <code className="text-white font-mono">{h.slug}</code></span>
              <span>Deadline: {formatDate(h.registrationDeadline)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editingHackathon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">
                {isCreating ? "Create Hackathon" : `Edit Hackathon: ${editingHackathon.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingHackathon(null);
                  setIsCreating(false);
                }}
                className="text-muted-foreground hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Hackathon Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {isCreating && (
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Slug (Unique URL) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g. spring-hack-2026"
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Tagline *</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
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
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#111827] border border-border">
                <div className="col-span-2">
                  <label className="text-teal-400 block mb-1 font-bold">
                    Registration Fee (INR) *
                  </label>
                  <p className="text-[11px] text-muted-foreground mb-1.5">
                    Changing this immediately updates the live public fee shown to participants!
                  </p>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    className="w-full bg-card border border-teal-500/50 rounded-lg px-3 py-2 text-sm font-extrabold text-teal-300 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Min Team Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Max Team Size</label>
                  <input
                    type="number"
                    min={minTeamSize}
                    max={10}
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Registration Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                  <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="SUBMISSION_OPEN">SUBMISSION_OPEN</option>
                  <option value="SUBMISSION_CLOSED">SUBMISSION_CLOSED</option>
                  <option value="JUDGING">JUDGING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHackathon(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
