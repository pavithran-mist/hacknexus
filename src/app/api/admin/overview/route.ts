import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);

    // Calculate real database values
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
    ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // Format theme breakdown for Recharts
    const teamsByTheme = themesWithTeams.map((t) => ({
      name: t.name,
      teams: t._count.teams,
    }));

    // Format problems selected for Recharts
    const problemsSelected = problemsWithTeams.map((p) => ({
      code: p.problemCode,
      title: p.title.length > 20 ? p.title.substring(0, 20) + "..." : p.title,
      teams: p._count.teams,
    }));

    // Group registrations by day for timeline chart
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

    const paymentStatusDistribution = [
      { name: "Paid", value: paidRegistrations, color: "#16A34A" },
      { name: "Pending", value: pendingPayments, color: "#D97706" },
    ];

    return NextResponse.json({
      stats: {
        totalTeams,
        totalParticipants,
        paidRegistrations,
        pendingPayments,
        totalRevenue,
        totalPrototypes,
        totalSubmissions,
        activeThemesCount,
        activeProblemsCount,
      },
      charts: {
        teamsByTheme,
        problemsSelected,
        registrationsTimeline,
        paymentStatusDistribution,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
