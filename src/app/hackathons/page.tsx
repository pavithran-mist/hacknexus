import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Users, IndianRupee, ArrowRight, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HackathonsPage() {
  const hackathons = await prisma.hackathon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          teams: true,
          problems: true,
          themes: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Competitions & Sprints</h1>
        <p className="text-sm text-muted-foreground">
          Discover active and upcoming technology hackathons hosted on the HackNexus platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((h) => (
          <div
            key={h.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  {h.status.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {h._count.teams} Teams Registered
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white hover:text-primary transition-colors">
                  {h.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {h.tagline}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-border text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Fee</span>
                  <span className="font-bold text-white">
                    {formatCurrency(h.registrationFee, h.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Team Size</span>
                  <span className="font-bold text-white">
                    {h.minTeamSize}–{h.maxTeamSize} Members
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Registration Closes</span>
                  <span className="font-bold text-white">{formatDate(h.registrationDeadline)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Hackathon Dates</span>
                  <span className="font-bold text-white">{formatDate(h.hackathonStartDate)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/register-team?hackathonId=${h.id}`}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Register for {formatCurrency(h.registrationFee, h.currency)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
