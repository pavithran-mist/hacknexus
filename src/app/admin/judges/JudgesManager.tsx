"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Building,
  UserCheck,
} from "lucide-react";

export default function JudgesManager({
  initialJudges,
  hackathons,
  submissions,
}: {
  initialJudges: any[];
  hackathons: any[];
  submissions: any[];
}) {
  const router = useRouter();
  const [judges, setJudges] = useState(initialJudges);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("JudgePass2026!");
  const [designation, setDesignation] = useState("Senior Staff Engineer");
  const [company, setCompany] = useState("Google DeepMind");
  const [expertise, setExpertise] = useState("Distributed Systems, ML");
  const [bio, setBio] = useState("Expert evaluator with 10+ years experience.");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          name,
          email,
          password,
          designation,
          company,
          expertise,
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create judge");
        setSubmitting(false);
        return;
      }

      setMessage(`Judge "${name}" created successfully! Login: ${email}`);
      setCreateModalOpen(false);
      router.refresh();

      // Refresh judges
      const updated = await fetch("/api/admin/judges").then((r) => r.json());
      if (updated.judges) setJudges(updated.judges);
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

      <div className="flex justify-end">
        <button
          onClick={() => {
            setCreateModalOpen(true);
            setError("");
          }}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add New Judge
        </button>
      </div>

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {judges.map((j) => {
          const totalAssigned = j.assignments?.length || 0;
          const completed = j.assignments?.filter((a: any) => a.status === "COMPLETED").length || 0;
          const inProgress = totalAssigned - completed;

          return (
            <div
              key={j.id}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{j.user?.name}</h3>
                      <p className="text-xs text-muted-foreground">{j.designation} at {j.company}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-[#111827] px-2 py-0.5 rounded text-muted-foreground">
                    {j.hackathon?.name}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-white">Email:</strong> {j.user?.email}</p>
                  <p><strong className="text-white">Specialization:</strong> {j.expertise}</p>
                  {j.bio && <p className="italic text-[11px] pt-1">{j.bio}</p>}
                </div>
              </div>

              {/* Scoring Progress Metrics */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">
                    Evaluation Progress
                  </span>
                  <span className="text-teal-400 font-bold">
                    {completed} / {totalAssigned} Completed
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[#111827] border border-border">
                    <span className="text-white font-bold block">{totalAssigned}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Assigned</span>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-border">
                    <span className="text-amber-400 font-bold block">{inProgress}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">In Progress</span>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-border">
                    <span className="text-emerald-400 font-bold block">{completed}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Judge Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">Create New Judge Profile</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateJudge} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Assigned Hackathon *</label>
                <select
                  value={hackathonId}
                  onChange={(e) => setHackathonId(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Judge Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Elena Rostova"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="judge.elena@domain.com"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Company / Org *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Domain Expertise *</label>
                <input
                  type="text"
                  required
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="Computer Vision, Distributed Systems, Cloud Architecture"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Bio / Profile</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save Judge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
