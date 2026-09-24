"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight, Building, Layers } from "lucide-react";

interface Problem {
  id: string;
  problemCode: string;
  title: string;
  description: string;
  organization: string;
  difficulty: string;
  technologies: string;
  requirements: string;
  expectedOutput: string;
  theme: { id: string; name: string };
  hackathon: { id: string; name: string };
}

interface ProblemsClientProps {
  initialProblems: Problem[];
  themes: { id: string; name: string }[];
  initialTheme: string;
  initialDifficulty: string;
  initialQuery: string;
}

export default function ProblemsClient({
  initialProblems,
  themes,
  initialTheme,
  initialDifficulty,
  initialQuery,
}: ProblemsClientProps) {
  const [search, setSearch] = useState(initialQuery);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  const filteredProblems = useMemo(() => {
    return initialProblems.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.problemCode.toLowerCase().includes(search.toLowerCase()) ||
        p.technologies.toLowerCase().includes(search.toLowerCase()) ||
        p.organization.toLowerCase().includes(search.toLowerCase());

      const matchesTheme =
        selectedTheme === "" || p.theme.id === selectedTheme;

      const matchesDifficulty =
        selectedDifficulty === "" || p.difficulty === selectedDifficulty;

      return matchesSearch && matchesTheme && matchesDifficulty;
    });
  }, [initialProblems, search, selectedTheme, selectedDifficulty]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by keywords, technologies, problem code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Theme Filter */}
          <div>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Themes ({themes.length})</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Quick clear tags */}
        {(search || selectedTheme || selectedDifficulty) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <span>Active filters:</span>
            {search && (
              <span className="bg-[#111827] px-2 py-0.5 rounded text-white border border-border">
                Keyword: &quot;{search}&quot;
              </span>
            )}
            {selectedTheme && (
              <span className="bg-[#111827] px-2 py-0.5 rounded text-white border border-border">
                Theme: {themes.find((t) => t.id === selectedTheme)?.name}
              </span>
            )}
            {selectedDifficulty && (
              <span className="bg-[#111827] px-2 py-0.5 rounded text-white border border-border">
                Difficulty: {selectedDifficulty}
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setSelectedTheme("");
                setSelectedDifficulty("");
              }}
              className="text-primary hover:underline text-xs ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-white">{filteredProblems.length}</strong> of{" "}
          {initialProblems.length} Problem Statements
        </span>
      </div>

      {/* Problems Grid */}
      {filteredProblems.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-white">No problem statements match your criteria</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search keywords or clearing the theme/difficulty filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedTheme("");
              setSelectedDifficulty("");
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-muted/60 text-primary border border-border">
                    {prob.problemCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      prob.difficulty === "HARD"
                        ? "bg-danger/20 text-rose-400 border border-danger/30"
                        : prob.difficulty === "MEDIUM"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white hover:text-primary transition-colors">
                    <Link href={`/problems/${prob.id}`}>{prob.title}</Link>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> {prob.organization}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {prob.theme.name}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {prob.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prob.technologies.split(",").map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#111827] border border-border px-2 py-0.5 rounded text-muted-foreground font-mono"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/problems/${prob.id}`}
                  className="text-xs text-muted-foreground hover:text-white font-medium transition-colors"
                >
                  View Details →
                </Link>
                <Link
                  href={`/register-team?problemId=${prob.id}&themeId=${prob.theme.id}`}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                >
                  <span>Select Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
