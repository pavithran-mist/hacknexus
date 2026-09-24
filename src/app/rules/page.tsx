import { prisma } from "@/lib/prisma";
import { ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const content = await prisma.websiteContent.findFirst({
    include: { hackathon: true },
  });

  const defaultRules = [
    "Eligibility: All team members must be enrolled students or professionals.",
    "Team Size: Squads must adhere strictly to the minimum and maximum size configuration.",
    "Original Work: Projects must be developed during the designated hackathon sprint window. Pre-existing commercial products are strictly prohibited.",
    "Open Source: Open source libraries and frameworks are permitted provided their licenses allow commercial/hackathon use.",
    "Code Freeze: Repository commits after the official code freeze deadline will not be considered by the jury.",
    "Jury Decision: The evaluation and ranking decisions of the jury panel are final and binding.",
  ];

  const rulesList = content?.rulesText
    ? content.rulesText.split("\n").filter((r) => r.trim().length > 0)
    : defaultRules;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Rules & Code of Conduct</h1>
        <p className="text-sm text-muted-foreground">
          Official competition guidelines and integrity policies for {content?.hackathon?.name || "HackNexus"}.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-primary">
          Competition Guidelines
        </h2>
        <div className="space-y-4">
          {rulesList.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-[#111827] border border-border/80">
              <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-white block font-semibold mb-0.5">Zero Tolerance on Plagiarism</strong>
            Any team found duplicating pre-existing public projects without disclosure or attempting unauthorized backend intrusion will face immediate disqualification.
          </div>
        </div>
      </div>
    </div>
  );
}
