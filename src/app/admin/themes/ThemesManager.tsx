"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Layers, CheckCircle, AlertCircle, X, ToggleLeft, ToggleRight } from "lucide-react";

export default function ThemesManager({
  initialThemes,
  hackathons,
}: {
  initialThemes: any[];
  hackathons: any[];
}) {
  const router = useRouter();
  const [themes, setThemes] = useState(initialThemes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any | null>(null);

  // Form states
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Brain");
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openCreateModal = () => {
    setEditingTheme(null);
    setHackathonId(hackathons[0]?.id || "");
    setName("");
    setDescription("");
    setIcon("Brain");
    setOrder(themes.length + 1);
    setStatus("ACTIVE");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTheme(t);
    setHackathonId(t.hackathonId);
    setName(t.name);
    setDescription(t.description);
    setIcon(t.icon || "Tag");
    setOrder(t.order);
    setStatus(t.status);
    setError("");
    setModalOpen(true);
  };

  const toggleStatus = async (t: any) => {
    const newStatus = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch(`/api/admin/themes/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setThemes((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
      );
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    try {
      await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
      setThemes((prev) => prev.filter((item) => item.id !== id));
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
      if (editingTheme) {
        const res = await fetch(`/api/admin/themes/${editingTheme.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, icon, order, status }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Update failed");
          setSubmitting(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/themes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hackathonId, name, description, icon, order, status }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Creation failed");
          setSubmitting(false);
          return;
        }
      }

      setModalOpen(false);
      router.refresh();

      // Refresh themes list
      const updated = await fetch("/api/admin/themes").then((r) => r.json());
      if (updated.themes) setThemes(updated.themes);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create New Theme
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Theme Name</th>
                <th className="p-3.5">Hackathon</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Problems</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {themes.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono text-muted-foreground font-bold">#{t.order}</td>
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    {t.name}
                  </td>
                  <td className="p-3.5 text-muted-foreground">{t.hackathon?.name}</td>
                  <td className="p-3.5 text-muted-foreground max-w-xs truncate">{t.description}</td>
                  <td className="p-3.5 font-mono text-primary font-semibold">
                    {t._count?.problems || 0}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleStatus(t)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1 rounded text-muted-foreground hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
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
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white">
                {editingTheme ? "Edit Theme" : "Create New Theme"}
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
              {!editingTheme && (
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
              )}

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Theme Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Quantum Computing"
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
                  placeholder="Detail the focus area and eligible technology stack..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Display Order</label>
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
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
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
                  {submitting ? "Saving..." : "Save Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
