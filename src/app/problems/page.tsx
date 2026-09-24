import { prisma } from "@/lib/prisma";
import ProblemsClient from "./ProblemsClient";

export const dynamic = "force-dynamic";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: { theme?: string; difficulty?: string; q?: string };
}) {
  const [themes, problems] = await Promise.all([
    prisma.theme.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.problemStatement.findMany({
      where: { status: "ACTIVE" },
      orderBy: { problemCode: "asc" },
      include: {
        theme: { select: { id: true, name: true } },
        hackathon: { select: { id: true, name: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Problem Statements</h1>
        <p className="text-sm text-muted-foreground">
          Real-world engineering challenges curated by industry and research organizations.
        </p>
      </div>

      <ProblemsClient
        initialProblems={problems}
        themes={themes}
        initialTheme={searchParams.theme || ""}
        initialDifficulty={searchParams.difficulty || ""}
        initialQuery={searchParams.q || ""}
      />
    </div>
  );
}
