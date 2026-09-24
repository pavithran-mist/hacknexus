import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResultsManagerClient from "./ResultsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login");
  }

  const submissions = await prisma.submission.findMany({
    include: {
      team: {
        include: {
          theme: true,
          problem: true,
          leader: true,
          members: true,
        },
      },
      scores: {
        include: {
          criterion: true,
          judge: {
            include: {
              user: true,
            },
          },
        },
      },
      judgeAssignments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const hackathon = await prisma.hackathon.findFirst({
    where: { isFeatured: true },
    select: { id: true, name: true, resultsPublished: true, resultsAnnouncedAt: true },
  });

  const formatted = submissions.map((sub) => {
    const totalScore = sub.scores.reduce((acc, s) => acc + s.score, 0);
    const averageScore = sub.scores.length > 0 ? Number((totalScore / (sub.judgeAssignments.length || 1)).toFixed(1)) : 0;

    return {
      id: sub.id,
      submissionNumber: sub.submissionNumber,
      projectTitle: sub.projectTitle,
      teamName: sub.team.name,
      college: sub.team.college,
      themeName: sub.team.theme?.name || "General Track",
      problemCode: sub.team.problem?.problemCode || "N/A",
      rank: sub.rank,
      award: sub.award,
      isWinner: sub.isWinner,
      certificateIssued: sub.certificateIssued,
      certificateId: sub.certificateId,
      scoresCount: sub.scores.length,
      averageScore,
      membersCount: sub.team.members.length,
      status: sub.status,
    };
  });

  formatted.sort((a, b) => b.averageScore - a.averageScore);

  return (
    <ResultsManagerClient
      initialSubmissions={formatted}
      initialHackathon={hackathon || { resultsPublished: false }}
    />
  );
}
