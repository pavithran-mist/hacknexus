"use client";

import { useState } from "react";
import { Search, ScrollText, Filter } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsManager({ initialLogs }: { initialLogs: any[] }) {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  const actions = Array.from(new Set(logs.map((l) => l.action)));
  const entities = Array.from(new Set(logs.map((l) => l.entity)));

  const filteredLogs = logs.filter((l) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      l.action.toLowerCase().includes(s) ||
      l.entity.toLowerCase().includes(s) ||
      (l.actorEmail && l.actorEmail.toLowerCase().includes(s)) ||
      (l.metadata && l.metadata.toLowerCase().includes(s));

    const matchesAction = filterAction === "" || l.action === filterAction;
    const matchesEntity = filterEntity === "" || l.entity === filterEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search action, actor email, metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#111827] border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Actions</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="bg-[#111827] border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Entities</option>
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {filteredLogs.length} Logged Events
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-sans">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Entity ID</th>
                <th className="p-3.5">Metadata Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="p-3.5 text-teal-400 font-bold whitespace-nowrap">
                    {log.actorEmail || "SYSTEM_WORKER"}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.action.includes("DELETE")
                          ? "bg-danger/20 text-rose-400"
                          : log.action.includes("ADJUST") || log.action.includes("REFUND")
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-primary/20 text-teal-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-white">{log.entity}</td>
                  <td className="p-3.5 text-muted-foreground max-w-[120px] truncate text-[10px]">
                    {log.entityId || "—"}
                  </td>
                  <td className="p-3.5 text-muted-foreground max-w-sm truncate text-[11px]">
                    {log.metadata || "—"}
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
