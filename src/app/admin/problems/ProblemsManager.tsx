"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Layers,
  FileCode,
  Building,
  CheckCircle,
  AlertCircle,
  X,
  Search,
} from "lucide-react";

export default function ProblemsManager({
  initialProblems,
  themes,
  hackathons,
}: {
  initialProblems: any[];
  themes: any[];
  hackathons: any[];
}) {
  const router = useRouter();
  const [problems, setProblems] = useState(initialProblems);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("");

  // Form states
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "");
  const [themeId, setThemeId] = useState(themes[0]?.id || "");
  const [problemCode, setProblemCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [technologies, setTechnologies] = useState("");
  const [requirements, setRequirements] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openCreateModal = () => {
    setEditingProblem(null);
    setHackathonId(hackathons[0]?.id || "");
    setThemeId(themes[0]?.id || "");
    setProblemCode(`HN-${Math.floor(100 + Math.random() * 900)}`);
    setTitle("");
    setDescription("");
    setOrganization("HackNexus Enterprise");
    setDifficulty("MEDIUM");
    setTechnologies("Full-Stack, Next.js, Python");
    setRequirements("Working functional prototype with live API telemetry");
    setExpectedOutput("Interactive demo showing primary user flow");
    setStatus("ACTIVE");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProblem(p);
    setHackathonId(p.hackathonId);
    setThemeId(p.themeId);
    setProblemCode(p.problemCode);
    setTitle(p.title);
    setDescription(p.description);
    setOrganization(p.organization);
    setDifficulty(p.difficulty);
    setTechnologies(p.technologies);
    setRequirements(p.requirements);
    setExpectedOutput(p.expectedOutput);
    setStatus(p.status);
    setError("");
    setModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/problems/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.problem) {
        setSuccess(`Problem duplicated as ${data.problem.problemCode}!`);
        // Refresh list
        const updated = await fetch("/api/admin/problems").then((r) => r.json());
        if (updated.problems) setProblems(updated.problems);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem statement?")) return;
    try {
      await fetch(`/api/admin/problems/${id}`, { method: "DELETE" });
      setProblems((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingProblem) {
        const res = await fetch(`/api/admin/problems/${editingProblem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            themeId,
            problemCode,
            title,
            description,
            organization,
            difficulty,
            technologies,
            requirements,
            expectedOutput,
            status,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Update failed");
          setSubmitting(false);
          return;
        }
        setSuccess(`Problem statement "${title}" updated successfully!`);
      } else {
        const res = await fetch("/api/admin/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hackathonId,
            themeId,
            problemCode,
            title,
            description,
            organization,
            difficulty,
            technologies,
            requirements,
            expectedOutput,
            status,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Creation failed");
          setSubmitting(false);
          return;
        }
        setSuccess(`Problem statement "${title}" created successfully!`);
      }

      setModalOpen(false);
      router.refresh();

      // Refresh problems list
      const updated = await fetch("/api/admin/problems").then((r) => r.json());
      if (updated.problems) setProblems(updated.problems);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problemCode.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase());
    const matchesTheme = filterTheme === "" || p.themeId === filterTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            className="bg-[#111827] border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Themes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Problem
        </button>
      </div>

      {/* Problems Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Title & Organization</th>
                <th className="p-3.5">Track</th>
                <th className="p-3.5">Difficulty</th>
                <th className="p-3.5">Teams</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProblems.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono text-primary font-bold">{p.problemCode}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{p.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {p.organization}
                    </span>
                  </td>
                  <td className="p-3.5 text-teal-300">{p.theme?.name}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.difficulty === "HARD"
                          ? "bg-danger/20 text-rose-400"
                          : p.difficulty === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-white">{p._count?.teams || 0}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded text-muted-foreground hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-1 rounded text-muted-foreground hover:text-teal-400"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 rounded text-muted-foreground hover:text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">
                {editingProblem ? `Edit Problem: ${problemCode}` : "Create Problem Statement"}
              </h3>
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

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Problem Code *</label>
                  <input
                    type="text"
                    required
                    value={problemCode}
                    onChange={(e) => setProblemCode(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Assigned Track *</label>
                  <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Organization Sponsor *</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Recommended Technologies *</label>
                <input
                  type="text"
                  required
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Python, PyTorch, Docker, OpenCV"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Requirements *</label>
                <textarea
                  rows={2}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Expected Output *</label>
                <textarea
                  rows={2}
                  required
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
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
                  {submitting ? "Saving..." : "Save Problem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
