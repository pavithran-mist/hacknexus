"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  Eye,
  X,
  ExternalLink,
  Users,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeamsManager({
  initialTeams,
  themes,
  problems,
}: {
  initialTeams: any[];
  themes: any[];
  problems: any[];
}) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [filterProblem, setFilterProblem] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [viewingTeam, setViewingTeam] = useState<any | null>(null);

  const handleStatusChange = async (teamId: string, status: string) => {
    try {
      await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, status } : t))
      );
      if (viewingTeam?.id === teamId) {
        setViewingTeam((prev: any) => ({ ...prev, status }));
      }
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to permanently delete this team?")) return;
    try {
      await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      if (viewingTeam?.id === teamId) setViewingTeam(null);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(s) ||
      t.leader?.name.toLowerCase().includes(s) ||
      t.leader?.email.toLowerCase().includes(s) ||
      t.registration?.registrationNumber?.toLowerCase().includes(s);

    const matchesTheme = filterTheme === "" || t.themeId === filterTheme;
    const matchesProblem = filterProblem === "" || t.problemId === filterProblem;
    const matchesStatus = filterStatus === "" || t.status === filterStatus;
    const matchesPayment =
      filterPayment === "" || t.registration?.status === filterPayment;

    return (
      matchesSearch &&
      matchesTheme &&
      matchesProblem &&
      matchesStatus &&
      matchesPayment
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team, leader, email, reg ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Theme */}
          <div>
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Tracks</option>
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* Problem */}
          <div>
            <select
              value={filterProblem}
              onChange={(e) => setFilterProblem(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Challenges</option>
              {problems.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.problemCode}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Payments</option>
              <option value="CONFIRMED">CONFIRMED (Paid)</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing <strong className="text-white">{filteredTeams.length}</strong> of{" "}
            {teams.length} Squads
          </span>
          {(search || filterTheme || filterProblem || filterStatus || filterPayment) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterTheme("");
                setFilterProblem("");
                setFilterStatus("");
                setFilterPayment("");
              }}
              className="text-primary hover:underline text-xs"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Reg ID</th>
                <th className="p-3.5">Team Name</th>
                <th className="p-3.5">Leader & College</th>
                <th className="p-3.5">Track / Problem</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Prototype</th>
                <th className="p-3.5">Submission</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTeams.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono text-teal-400 font-bold">
                    {t.registration?.registrationNumber || "PENDING"}
                  </td>
                  <td className="p-3.5 font-bold text-white">{t.name}</td>
                  <td className="p-3.5">
                    <span className="text-white block font-medium">
                      {t.leader?.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {t.college}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-teal-300 block">{t.theme?.name}</span>
                    <span className="font-mono text-primary text-[10px]">
                      {t.problem?.problemCode || "None"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        t.registration?.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {t.registration?.status || "PENDING"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.prototype?.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : t.prototype?.status === "SUBMITTED"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {t.prototype?.status || "NOT_SUBMITTED"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.submission
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {t.submission ? "SUBMITTED" : "PENDING"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        t.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : t.status === "REJECTED"
                          ? "bg-danger/20 text-rose-400"
                          : t.status === "SUSPENDED"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setViewingTeam(t)}
                      className="p-1 rounded text-muted-foreground hover:text-white"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {t.status !== "APPROVED" && (
                      <button
                        onClick={() => handleStatusChange(t.id, "APPROVED")}
                        className="p-1 rounded text-muted-foreground hover:text-emerald-400"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {t.status !== "REJECTED" && (
                      <button
                        onClick={() => handleStatusChange(t.id, "REJECTED")}
                        className="p-1 rounded text-muted-foreground hover:text-rose-400"
                        title="Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {t.status !== "SUSPENDED" && (
                      <button
                        onClick={() => handleStatusChange(t.id, "SUSPENDED")}
                        className="p-1 rounded text-muted-foreground hover:text-amber-400"
                        title="Suspend"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 rounded text-muted-foreground hover:text-danger"
                      title="Delete Team"
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

      {/* Team Details Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-xs text-teal-400 font-bold block">
                  {viewingTeam.registration?.registrationNumber || "NO_REG_ID"}
                </span>
                <h3 className="text-xl font-bold text-white">{viewingTeam.name}</h3>
              </div>
              <button onClick={() => setViewingTeam(null)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#111827] p-4 rounded-xl border border-border space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-primary block">Institution Details</span>
                <p><strong className="text-white">College:</strong> {viewingTeam.college}</p>
                <p><strong className="text-white">Department:</strong> {viewingTeam.department}</p>
                <p><strong className="text-white">Location:</strong> {viewingTeam.city}, {viewingTeam.state}, {viewingTeam.country}</p>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-border space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-blue-400 block">Registration Status</span>
                <p><strong className="text-white">Status:</strong> {viewingTeam.status}</p>
                <p><strong className="text-white">Payment:</strong> {viewingTeam.registration?.status || "PENDING"}</p>
                <p><strong className="text-white">Track:</strong> {viewingTeam.theme?.name}</p>
                <p><strong className="text-white">Challenge:</strong> {viewingTeam.problem?.problemCode}</p>
              </div>
            </div>

            {/* Squad Members */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Squad Members ({viewingTeam.members?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {viewingTeam.members?.map((m: any) => (
                  <div key={m.id} className="p-3 rounded-lg bg-[#111827] border border-border">
                    <p className="font-bold text-white">{m.name} {m.isLeader && "(Leader)"}</p>
                    <p className="text-muted-foreground text-[11px]">{m.email}</p>
                    <span className="text-[10px] text-teal-300 font-mono">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prototype Links if present */}
            {viewingTeam.prototype && (
              <div className="p-4 rounded-xl bg-[#111827] border border-border space-y-2 text-xs">
                <span className="font-bold text-teal-400 block text-[10px] uppercase">
                  Prototype Deliverables
                </span>
                <p className="truncate"><strong className="text-white">URL:</strong> {viewingTeam.prototype.prototypeUrl}</p>
                <p className="truncate"><strong className="text-white">GitHub:</strong> {viewingTeam.prototype.githubUrl}</p>
                <p className="text-muted-foreground">{viewingTeam.prototype.projectDescription}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(viewingTeam.id, "APPROVED")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Approve Team
                </button>
                <button
                  onClick={() => handleStatusChange(viewingTeam.id, "REJECTED")}
                  className="px-3 py-1.5 rounded-lg bg-danger hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Reject Team
                </button>
              </div>
              <button
                onClick={() => setViewingTeam(null)}
                className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
