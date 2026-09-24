import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CertificateViewerClient from "./CertificateViewerClient";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Search by certificateId or submissionNumber or registrationNumber
  const submission = await prisma.submission.findFirst({
    where: {
      OR: [
        { certificateId: id },
        { submissionNumber: id },
        { team: { registration: { registrationNumber: id } } },
      ],
    },
    include: {
      team: {
        include: {
          members: true,
          theme: true,
          problem: true,
          hackathon: true,
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  const certificateData = {
    certificateId: submission.certificateId || `CERT-HN2026-${submission.submissionNumber}`,
    teamName: submission.team.name,
    projectTitle: submission.projectTitle,
    college: submission.team.college,
    themeName: submission.team.theme?.name || "General Innovation Track",
    hackathonName: submission.team.hackathon.name,
    award: submission.award || "Certificate of Excellence & Completion",
    isWinner: submission.isWinner,
    rank: submission.rank,
    members: submission.team.members.map((m) => ({
      name: m.name,
      role: m.role,
      isLeader: m.isLeader,
    })),
    issuedDate: submission.updatedAt
      ? new Date(submission.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "October 16, 2026",
  };

  return <CertificateViewerClient cert={certificateData} />;
}
