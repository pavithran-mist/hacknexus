import { prisma } from "@/lib/prisma";
import CMSManager from "./CMSManager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [content, hackathon] = await Promise.all([
    prisma.websiteContent.findFirst(),
    prisma.hackathon.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Website CMS & Copywriter</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update homepage hero titles, subtitles, competition rules, about summaries, and contact info without touching source code.
        </p>
      </div>

      <CMSManager
        initialContent={content}
        hackathonId={hackathon?.id || ""}
      />
    </div>
  );
}
