import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  CreditCard,
  IndianRupee,
  Code2,
  Send,
  Layers,
  FileCode,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AdminCharts from "./AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query all database metrics directly
  const [
    totalTeams,
    totalParticipants,
    paidRegistrations,
    pendingPayments,
    successfulPayments,
    totalPrototypes,
    totalSubmissions,
    activeThemesCount,
    activeProblemsCount,
    themesWithTeams,
    problemsWithTeams,
    registrationsList,
    recentTeams,
  ] = await Promise.all([
    prisma.team.count(),
    prisma.teamMember.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({ where: { status: "SUCCESS" } }),
    prisma.prototype.count(),
    prisma.submission.count(),
    prisma.theme.count({ where: { status: "ACTIVE" } }),
    prisma.problemStatement.count({ where: { status: "ACTIVE" } }),
    prisma.theme.findMany({
      where: { status: "ACTIVE" },
      include: { _count: { select: { teams: true } } },
    }),
    prisma.problemStatement.findMany({
      where: { status: "ACTIVE" },
      include: { _count: { select: { teams: true } } },
    }),
    prisma.registration.findMany({
      select: { createdAt: true, status: true, feeAmount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.team.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        leader: true,
        theme: true,
        problem: true,
        registration: true,
        prototype: true,
        submission: true,
      },
    }),
  ]);

  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

  // Format Recharts data
  const teamsByTheme = themesWithTeams.map((t) => ({
    name: t.name,
    teams: t._count.teams,
  }));

  const problemsSelected = problemsWithTeams.map((p) => ({
    code: p.problemCode,
    title: p.title,
    teams: p._count.teams,
  }));

  const dateMap: Record<string, { date: string; registrations: number; revenue: number }> = {};
  for (const reg of registrationsList) {
    const dateKey = new Date(reg.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { date: dateKey, registrations: 0, revenue: 0 };
    }
    dateMap[dateKey].registrations += 1;
    if (reg.status === "CONFIRMED") {
      dateMap[dateKey].revenue += reg.feeAmount;
    }
  }
  const registrationsTimeline = Object.values(dateMap);

  const paymentDistribution = [
    { name: "Paid", value: paidRegistrations, color: "#10B981" },
    { name: "Pending", value: pendingPayments, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Operations & Analytics Command
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time telemetry and database record aggregation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/export-import"
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-white text-xs font-semibold hover:border-primary transition-colors"
          >
            Export Data
          </Link>
          <Link
            href="/admin/hackathons"
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            Manage Hackathons
          </Link>
        </div>
      </div>

      {/* 8 Real Database KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Teams */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Squads
            </span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalTeams}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {totalParticipants} total innovators
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {formatCurrency(totalRevenue, "INR")}
          </p>
          <p className="text-[11px] text-emerald-400 font-mono">
            {paidRegistrations} paid registrations
          </p>
        </div>

        {/* Prototypes */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-teal-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Prototypes
            </span>
            <Code2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalPrototypes}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Active code repositories
          </p>
        </div>

        {/* Final Submissions */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Final Submissions
            </span>
            <Send className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalSubmissions}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Ready for jury grading
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <AdminCharts
        teamsByTheme={teamsByTheme}
        problemsSelected={problemsSelected}
        registrationsTimeline={registrationsTimeline}
        paymentDistribution={paymentDistribution}
      />

      {/* Recent Teams Table */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Team Registrations</h3>
            <p className="text-xs text-muted-foreground">Latest squads registered in the platform database</p>
          </div>
          <Link
            href="/admin/teams"
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all teams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3">Team Name</th>
                <th className="p-3">Leader</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Track</th>
                <th className="p-3">Problem Code</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTeams.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-bold text-white">{t.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {t.leader?.name} ({t.leader?.email})
                  </td>
                  <td className="p-3 text-muted-foreground">{t.college}</td>
                  <td className="p-3 text-teal-300">{t.theme?.name || "—"}</td>
                  <td className="p-3 font-mono text-primary font-semibold">
                    {t.problem?.problemCode || "—"}
                  </td>
                  <td className="p-3">
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
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-muted-foreground font-mono">
                    {formatDate(t.createdAt)}
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
