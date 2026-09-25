import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Code2,
  Calendar,
  Users,
  IndianRupee,
  Clock,
  ArrowRight,
  Brain,
  Shield,
  HeartPulse,
  Sprout,
  Building2,
  Tag,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch active featured hackathon from database
  const hackathon = await prisma.hackathon.findFirst({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    include: {
      themes: {
        where: { status: "ACTIVE" },
        orderBy: { order: "asc" },
      },
      problems: {
        where: { status: "ACTIVE" },
        include: { theme: true },
        take: 4,
      },
      timelineEvents: {
        orderBy: { order: "asc" },
        take: 4,
      },
      sponsors: {
        orderBy: { order: "asc" },
      },
      websiteContent: true,
      _count: {
        select: {
          teams: true,
          problems: true,
          themes: true,
        },
      },
    },
  });

  const latestAnnouncement = hackathon
    ? await prisma.announcement.findFirst({
        where: {
          hackathonId: hackathon.id,
          targetAudience: { in: ["EVERYONE", "PARTICIPANTS"] },
        },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const winners = hackathon?.resultsPublished
    ? await prisma.submission.findMany({
        where: { hackathonId: hackathon.id, isWinner: true },
        include: { team: { include: { theme: true } } },
        orderBy: { rank: "asc" },
        take: 3,
      })
    : [];

  const fallbackData = {
    name: "National Innovation Hackathon 2026",
    tagline: "Turn Your Ideas Into Innovation",
    registrationFee: 499,
    currency: "INR",
    minTeamSize: 2,
    maxTeamSize: 4,
    status: "REGISTRATION_OPEN",
    registrationDeadline: new Date(Date.now() + 15 * 86400000),
    hackathonStartDate: new Date(Date.now() + 20 * 86400000),
  };

  const currentHackathon = hackathon || fallbackData;
  const content = hackathon?.websiteContent;
  const heroTitle = content?.heroTitle || "Turn Your Ideas Into Innovation";
  const heroSubtitle =
    content?.heroSubtitle ||
    "Build bold solutions. Collaborate with brilliant teams. Compete on a platform designed for modern hackathons.";

  // Helper for theme icons
  const getThemeIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "ai & machine learning":
        return <Brain className="w-6 h-6 text-teal-400" />;
      case "cybersecurity":
        return <Shield className="w-6 h-6 text-blue-400" />;
      case "healthtech":
        return <HeartPulse className="w-6 h-6 text-rose-400" />;
      case "agriculture":
        return <Sprout className="w-6 h-6 text-emerald-400" />;
      case "smart cities":
        return <Building2 className="w-6 h-6 text-amber-400" />;
      default:
        return <Tag className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#30363D]/40">
        {/* Tech grid background accent */}
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(#DC2626_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Latest Admin Announcement Strip */}
          {latestAnnouncement && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#161B22] border border-red-500/40 text-xs text-white max-w-xl mx-auto shadow-lg shadow-red-950/20">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                ANNOUNCEMENT
              </span>
              <span className="truncate font-medium text-gray-300">
                {latestAnnouncement.title}: {latestAnnouncement.message}
              </span>
            </div>
          )}

          {/* Status pill */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{currentHackathon.status.replace(/_/g, " ")}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-white font-mono">{currentHackathon.name}</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {heroTitle.includes("Ideas") ? (
              <>
                Turn Your Ideas Into{" "}
                <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
                  Innovation
                </span>
              </>
            ) : (
              heroTitle
            )}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Key Database Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
            <div className="bg-card/70 backdrop-blur border border-border p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 text-primary mb-1">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Registration Fee
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(currentHackathon.registrationFee, currentHackathon.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Per team</p>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Team Size
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {currentHackathon.minTeamSize}–{currentHackathon.maxTeamSize}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Members per squad</p>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Registration Closes
                </span>
              </div>
              <p className="text-lg font-bold text-white truncate">
                {formatDate(currentHackathon.registrationDeadline)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">11:59 PM IST</p>
            </div>

            <div className="bg-card/70 backdrop-blur border border-border p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Hackathon Begins
                </span>
              </div>
              <p className="text-lg font-bold text-white truncate">
                {formatDate(currentHackathon.hackathonStartDate)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Opening Ceremony</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register-team"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>Register Your Team</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/problems"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-card hover:bg-muted/40 text-white font-semibold text-base border border-border transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Problems</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WINNERS HALL OF FAME (When Results Published) */}
      {winners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-[#161B22] to-red-950/40 border-2 border-red-500/50 rounded-3xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
                🏆 Official Podium & Hall of Fame
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                Hackathon Winners & Laureates
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Celebrating the groundbreaking solutions and top-ranking squads of {currentHackathon.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {winners.map((win) => (
                <div
                  key={win.id}
                  className={`p-6 rounded-2xl border text-center space-y-4 relative transition-all ${
                    win.rank === 1
                      ? "bg-gradient-to-b from-amber-500/10 to-[#161B22] border-amber-500/50 shadow-lg shadow-amber-500/10 transform md:-translate-y-2"
                      : "bg-[#161B22] border-[#30363D]"
                  }`}
                >
                  <div className="inline-block p-3 rounded-full bg-white/5 border border-white/10 text-2xl">
                    {win.rank === 1 ? "🥇" : win.rank === 2 ? "🥈" : "🥉"}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                      {win.award || `Rank #${win.rank}`}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{win.team.name}</h3>
                    <p className="text-xs text-muted-foreground">{win.projectTitle}</p>
                  </div>
                  {win.certificateId && (
                    <Link
                      href={`/certificate/${win.certificateId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
                    >
                      <span>View Official Certificate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. THEMES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Tracks & Focus</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Hackathon Themes
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Choose from five cross-disciplinary tracks addressing pressing enterprise and social challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {hackathon?.themes && hackathon.themes.length > 0 ? (
            hackathon.themes.map((theme) => (
              <div
                key={theme.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[#111827] border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getThemeIcon(theme.name)}
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50">
                  <Link
                    href={`/problems?theme=${encodeURIComponent(theme.id)}`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View track problems <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-muted-foreground py-8">
              No themes registered yet.
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED PROBLEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Live Challenges</h2>
            <p className="text-3xl font-extrabold text-white">Featured Problem Statements</p>
            <p className="text-sm text-muted-foreground">
              Select an official problem statement to solve during the competition.
            </p>
          </div>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Browse all {hackathon?._count.problems || 5} problems <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathon?.problems && hackathon.problems.length > 0 ? (
            hackathon.problems.map((prob) => (
              <div
                key={prob.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between"
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sponsored by {prob.organization} • {prob.theme.name}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
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

                <div className="pt-5 mt-5 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/problems/${prob.id}`}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    View requirements →
                  </Link>
                  <Link
                    href={`/register-team?problemId=${prob.id}&themeId=${prob.themeId}`}
                    className="px-3.5 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 text-xs font-semibold transition-all"
                  >
                    Select Problem
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-muted-foreground py-8">
              No problem statements found.
            </div>
          )}
        </div>
      </section>

      {/* 4. TIMELINE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Schedule</h2>
          <p className="text-3xl font-extrabold text-white">Event Timeline</p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            From initial registration to the final jury pitch, mark these key milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {hackathon?.timelineEvents && hackathon.timelineEvents.length > 0 ? (
            hackathon.timelineEvents.map((event, idx) => (
              <div
                key={event.id}
                className="bg-card border border-border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      STEP 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        event.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : event.status === "ACTIVE"
                          ? "bg-primary/20 text-teal-300 animate-pulse"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{event.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-primary font-semibold">
                  {event.date} {event.time && `• ${event.time}`}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-muted-foreground py-8">
              Timeline under construction.
            </div>
          )}
        </div>
      </section>

      {/* 5. SPONSORS */}
      {hackathon?.sponsors && hackathon.sponsors.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 text-center space-y-6">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
            Backed by Industry Leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {hackathon.sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="px-6 py-3 rounded-lg bg-card/60 border border-border text-foreground font-bold text-sm tracking-wide hover:border-primary/40 transition-colors"
              >
                {sponsor.name}{" "}
                <span className="text-[10px] text-muted-foreground font-normal ml-1">
                  ({sponsor.tier})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Need Clarification?</h2>
          <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Who is eligible to participate?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              Undergraduate, postgraduate students, and early-career software developers worldwide are eligible.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> What is the registration fee and refund policy?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              The fee is {formatCurrency(currentHackathon.registrationFee, currentHackathon.currency)} per squad. Registration fees are non-refundable once payment is confirmed.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> When and where do I submit my prototype and project files?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              Prototypes, GitHub repositories, and video demos are submitted through your Participant Dashboard Final Submission page as you approach code freeze.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/faq" className="text-xs text-primary font-semibold hover:underline">
            View all questions & answers →
          </Link>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-card via-[#1A2536] to-card border border-primary/30 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Innovation Awaits
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Ready to Build Your Breakthrough?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Assemble your team of {currentHackathon.minTeamSize} to {currentHackathon.maxTeamSize} members, select a challenge, and compete for prizes and recognition.
          </p>
          <div className="pt-2">
            <Link
              href="/register-team"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register Now for {formatCurrency(currentHackathon.registrationFee, currentHackathon.currency)}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
