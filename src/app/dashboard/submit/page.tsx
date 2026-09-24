import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import FinalSubmissionForm from "./FinalSubmissionForm";

export const dynamic = "force-dynamic";

export default async function SubmitProjectPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/submit");
  }

  const member = await prisma.teamMember.findFirst({
    where: { email: user.email.toLowerCase() },
    include: {
      team: {
        include: {
          hackathon: true,
          prototype: true,
          submission: true,
          registration: true,
        },
      },
    },
  });

  const team = member?.team;

  if (!team) {
    redirect("/dashboard");
  }

  const hackathon = team.hackathon;
  const isDeadlinePassed = new Date() > new Date(hackathon.submissionDeadline);
  const isApproaching =
    !isDeadlinePassed &&
    new Date(hackathon.submissionDeadline).getTime() - new Date().getTime() <
      24 * 60 * 60 * 1000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Final Project Submission
        </h1>
        <p className="text-xs text-muted-foreground">
          Submit your complete hackathon deliverable for official jury scoring for {hackathon.name}.
        </p>
      </div>

      {isApproaching && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            <strong>Deadline Approaching:</strong> Final code freeze is within 24 hours. Ensure your repositories and slide decks are publicly accessible.
          </span>
        </div>
      )}

      {isDeadlinePassed ? (
        <div className="bg-card border border-danger/40 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-danger/20 text-rose-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Submission Closed</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The deadline ({new Date(hackathon.submissionDeadline).toLocaleString()}) has passed. No new submissions can be recorded for this competition cycle.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-card border border-border text-white text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <FinalSubmissionForm
          teamId={team.id}
          hackathonId={hackathon.id}
          existingSubmission={team.submission}
          prototype={team.prototype}
        />
      )}
    </div>
  );
}
