"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Users, FileText, CreditCard, Layers, Trophy } from "lucide-react";

interface SearchResults {
  teams: any[];
  participants: any[];
  registrations: any[];
  payments: any[];
  problems: any[];
  submissions: any[];
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    teams: [],
    participants: [],
    registrations: [],
    payments: [],
    problems: [],
    submissions: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({
        teams: [],
        participants: [],
        registrations: [],
        payments: [],
        problems: [],
        submissions: [],
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.teams.length +
    results.participants.length +
    results.registrations.length +
    results.payments.length +
    results.problems.length +
    results.submissions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-[#111827]">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            placeholder="Search teams, participants, reg IDs, TXN IDs, problems, submissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1 divide-y divide-border/60">
          {query.length >= 2 && totalResults === 0 && !loading && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No platform records matching &quot;{query}&quot;
            </div>
          )}

          {/* Teams */}
          {results.teams.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Teams ({results.teams.length})
              </span>
              <div className="space-y-1">
                {results.teams.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/teams`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111827] hover:bg-muted/40 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{t.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Leader: {t.leader?.name} ({t.leader?.email}) • {t.college}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card text-teal-300">
                      {t.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Registration IDs */}
          {results.registrations.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Registrations ({results.registrations.length})
              </span>
              <div className="space-y-1">
                {results.registrations.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/teams`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111827] hover:bg-muted/40 transition-colors text-xs"
                  >
                    <span className="font-mono text-teal-400 font-bold">
                      {r.registrationNumber}
                    </span>
                    <span className="text-white text-[11px]">{r.team?.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{r.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {results.payments.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payments ({results.payments.length})
              </span>
              <div className="space-y-1">
                {results.payments.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/payments`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111827] hover:bg-muted/40 transition-colors text-xs"
                  >
                    <span className="font-mono text-white">{p.transactionId}</span>
                    <span className="text-[11px] text-muted-foreground">{p.team?.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      ₹{p.amount} • {p.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Problems */}
          {results.problems.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Problem Statements ({results.problems.length})
              </span>
              <div className="space-y-1">
                {results.problems.map((pr) => (
                  <Link
                    key={pr.id}
                    href={`/admin/problems`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111827] hover:bg-muted/40 transition-colors text-xs"
                  >
                    <span className="font-mono text-primary font-bold">{pr.problemCode}</span>
                    <span className="text-white text-[11px] truncate max-w-sm">{pr.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Submissions */}
          {results.submissions.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Submissions ({results.submissions.length})
              </span>
              <div className="space-y-1">
                {results.submissions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/submissions`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111827] hover:bg-muted/40 transition-colors text-xs"
                  >
                    <span className="font-mono text-teal-400 font-bold">{s.submissionNumber}</span>
                    <span className="text-white text-[11px] truncate max-w-sm">{s.projectTitle}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.team?.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#111827] border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Press ESC or click close to dismiss</span>
          <span>Global Search Index</span>
        </div>
      </div>
    </div>
  );
}
