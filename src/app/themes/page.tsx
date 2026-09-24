import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Brain, Shield, HeartPulse, Sprout, Building2, Tag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const themes = await prisma.theme.findMany({
    where: { status: "ACTIVE" },
    orderBy: { order: "asc" },
    include: {
      hackathon: { select: { name: true } },
      problems: {
        where: { status: "ACTIVE" },
        select: { id: true, title: true, problemCode: true, difficulty: true },
      },
      _count: { select: { problems: true, teams: true } },
    },
  });

  const getThemeIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "ai & machine learning":
        return <Brain className="w-8 h-8 text-teal-400" />;
      case "cybersecurity":
        return <Shield className="w-8 h-8 text-blue-400" />;
      case "healthtech":
        return <HeartPulse className="w-8 h-8 text-rose-400" />;
      case "agriculture":
        return <Sprout className="w-8 h-8 text-emerald-400" />;
      case "smart cities":
        return <Building2 className="w-8 h-8 text-amber-400" />;
      default:
        return <Tag className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Innovation Tracks</h1>
        <p className="text-sm text-muted-foreground">
          Explore specialized domain themes with targeted problem statements designed to test your technical mettle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-xl bg-[#111827] border border-border flex items-center justify-center">
                  {getThemeIcon(theme.name)}
                </div>
                <span className="text-xs font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  {theme._count.problems} Challenges
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{theme.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {theme.problems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground block">
                    Available Problems
                  </span>
                  <div className="space-y-1.5">
                    {theme.problems.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        href={`/problems/${p.id}`}
                        className="text-xs block text-muted-foreground hover:text-white truncate"
                      >
                        <span className="font-mono text-primary text-[10px] mr-1.5">
                          {p.problemCode}
                        </span>
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={`/problems?theme=${encodeURIComponent(theme.id)}`}
                className="w-full py-2.5 rounded-lg bg-card hover:bg-muted/50 border border-border text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Browse All {theme.name} Problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
