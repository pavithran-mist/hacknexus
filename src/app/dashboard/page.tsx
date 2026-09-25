import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Code2,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Video,
  Send,
  Layers,
  Sparkles,
  Trophy,
  CreditCard,
  Building,
  QrCode,
  Bell,
  Award,
  Download,
  AlertCircle,
  Copy,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";
import PrototypeModalClient from "./PrototypeModalClient";
import CountdownTimer from "./CountdownTimer";

export const dynamic = "force-dynamic";

export default async function ParticipantDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch team where user is leader or member
  const memberRecord = await prisma.teamMember.findFirst({
    where: { email: user.email.toLowerCase() },
    include: { team: true },
  });

  const teamId = memberRecord?.teamId;

  const team = teamId
    ? await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          hackathon: true,
          theme: true,
          problem: true,
          members: true,
          registration: true,
          payments: { orderBy: { createdAt: "desc" } },
          prototype: true,
          submission: true,
        },
      })
    : null;

  // Fetch announcements for participants
  const announcements = team?.hackathonId
    ? await prisma.announcement.findMany({
        where: {
          hackathonId: team.hackathonId,
          targetAudience: { in: ["EVERYONE", "PARTICIPANTS"] },
          OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  // Fetch owner account details
  const ownerSettings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          "owner_account_name",
          "owner_upi_id",
          "owner_bank_name",
          "owner_account_number",
          "owner_ifsc_code",
          "owner_contact_email",
          "owner_contact_phone",
          "results_published",
        ],
      },
    },
  });

  const ownerAccount: Record<string, string> = {
    owner_account_name: "HackNexus Global Foundation",
    owner_upi_id: "hacknexus@upi",
    owner_bank_name: "HDFC Bank Ltd",
    owner_account_number: "50200084729184",
    owner_ifsc_code: "HDFC0001234",
    owner_contact_phone: "+91 98765 43210",
    owner_contact_email: "payments@hacknexus.io",
    results_published: "false",
  };

  ownerSettings.forEach((s) => {
    ownerAccount[s.key] = s.value;
  });

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#161B22] border border-[#30363D] flex items-center justify-center text-red-500 mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">No Team Registration Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You are currently signed in as <strong className="text-white">{user.email}</strong>, but have not registered or joined a hackathon squad yet.
        </p>
        <div>
          <Link
            href="/register-team"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all inline-flex items-center gap-2"
          >
            <span>Register a Squad</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const hackathon = team.hackathon;
  const registration = team.registration;
  const payment = team.payments[0];
  const prototype = team.prototype;
  const submission = team.submission;

  const isDeadlinePassed = new Date() > new Date(hackathon.submissionDeadline);
  const isResultsPublished =
    hackathon.resultsPublished || ownerAccount.results_published === "true";

  // Certificate ID fallback
  const certId =
    submission?.certificateId ||
    `CERT-HN2026-${registration?.registrationNumber || team.id.slice(0, 8)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Live Admin Announcement Alerts (High Priority Banner) */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements
            .filter((a) => a.priority === "HIGH" || a.priority === "URGENT")
            .map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#161B22] to-[#161B22] border border-red-500/40 flex items-center justify-between gap-4 shadow-lg shadow-red-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 flex-shrink-0 animate-pulse">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {ann.priority} Broadcast
                      </span>
                      <h3 className="text-xs font-bold text-white">{ann.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ann.message}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0 hidden sm:inline">
                  {formatDate(ann.createdAt)}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Results & Certificate Banner (When Published) */}
      {isResultsPublished && (
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-[#161B22] border border-red-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5 text-amber-300" /> Official Results Released
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {submission?.isWinner
                  ? `🎉 Congratulations! Rank #${submission.rank || 1} Champion`
                  : "🏆 Hackathon Evaluation Complete!"}
              </h2>

              <p className="text-xs sm:text-sm text-red-100 max-w-xl">
                {submission?.award
                  ? `Your squad was officially awarded: "${submission.award}". Your verified credentials and Certificate of Merit are ready.`
                  : "The Jury has evaluated all projects. Your verified digital Certificate of Excellence and Completion is now issued."}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href={`/certificate/${certId}`}
                target="_blank"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-red-700 font-extrabold text-xs shadow-xl flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Award className="w-4 h-4 text-red-600" />
                <span>View & Print Official Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Admin Verification Banner */}
      {(registration?.status === "PENDING" || payment?.status === "PENDING") && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Payment Verification in Progress
                </span>
                {payment?.paymentId && (
                  <span className="text-xs font-mono text-amber-200">
                    UTR: <strong>{payment.paymentId}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Your payment reference has been submitted. The HackNexus organizers are verifying your transaction against their bank account. Once approved in the admin panel, your squad registration will be confirmed.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Support Contact</span>
            <span className="text-xs text-white font-mono">{ownerAccount.owner_contact_phone}</span>
          </div>
        </div>
      )}

      {/* Top Welcome Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                team.status === "APPROVED"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {team.status === "APPROVED" ? "APPROVED" : "PENDING APPROVAL"}
            </span>
            <span className="text-xs text-muted-foreground">{hackathon.name}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{team.name}</h1>
          <p className="text-xs text-muted-foreground">
            Lead by <strong className="text-white">{team.members.find((m) => m.isLeader)?.name || user.name}</strong> • {team.college}
          </p>
        </div>

        {/* Official Registration Badge */}
        <div className="bg-[#0D1117] border border-[#30363D] p-4 rounded-xl text-right sm:min-w-[220px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Registration & Payment ID
          </span>
          <span className="font-mono text-base font-extrabold text-red-400 block mt-0.5">
            {registration?.registrationNumber || "PENDING"}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-1">
            Payment Status:{" "}
            <strong
              className={
                registration?.status === "CONFIRMED"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            >
              {registration?.status || "PENDING"}
            </strong>
          </span>
        </div>
      </div>

      {/* 4-Step Hackathon Lifecycle Tracker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Registration & Payment */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">1. Registration</span>
            {registration?.status === "CONFIRMED" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-sm font-bold text-white">
            {registration?.status === "CONFIRMED" ? "Confirmed" : "Pending Verification"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {registration?.status === "CONFIRMED" ? "Team roster & fee paid" : "Awaiting Admin Review"}
          </p>
        </div>

        {/* 2. Hackathon Sprint */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">2. Prototype</span>
            {prototype?.status === "APPROVED" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-sm font-bold text-white">
            {prototype?.status || "In Development"}
          </p>
          <p className="text-[11px] text-muted-foreground">Sprint checkpoint</p>
        </div>

        {/* 3. Final Project Submission */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">3. Final Submission</span>
            {submission ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-sm font-bold text-white">
            {submission ? "Submitted" : "Code Freeze"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {submission?.submissionNumber || "Finish Hackathon"}
          </p>
        </div>

        {/* 4. Results & Certificates */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">4. Results</span>
            {isResultsPublished ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Trophy className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-bold text-white">
            {isResultsPublished ? "Published" : "Under Jury"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isResultsPublished ? "Certificate Ready" : "Scoring in progress"}
          </p>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Deliverables */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selected Track & Problem Statement */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Assigned Track & Challenge
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {team.problem?.problemCode || "N/A"}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                {team.problem?.title || "Problem Statement Not Selected"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {team.problem?.description ||
                  "No specific problem statement assigned yet. Please contact event coordinators."}
              </p>
            </div>

            <div className="pt-3 border-t border-[#30363D] flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-white">
                Theme: <strong className="text-red-400">{team.theme?.name || "General"}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-white">
                Difficulty:{" "}
                <strong className="text-amber-400">{team.problem?.difficulty || "MEDIUM"}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-muted-foreground">
                Stack: {team.problem?.technologies || "Open Tech"}
              </span>
            </div>
          </div>

          {/* Prototype Checkpoint Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Prototype Submission (Mid-Sprint)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Interim prototype checkpoint URL and code repository.
                </p>
              </div>

              <PrototypeModalClient teamId={team.id} existingPrototype={prototype} />
            </div>

            {prototype ? (
              <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Current Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      prototype.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {prototype.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {prototype.projectDescription}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {prototype.prototypeUrl && (
                    <a
                      href={prototype.prototypeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                      <span>LIVE PROTOTYPE</span>
                    </a>
                  )}

                  {prototype.githubUrl && (
                    <a
                      href={prototype.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>GITHUB REPOSITORY</span>
                    </a>
                  )}

                  {prototype.videoUrl && (
                    <a
                      href={prototype.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      <span>WATCH DEMO</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No prototype link submitted yet. Click &quot;Update Prototype&quot; to configure your links.
              </p>
            )}
          </div>

          {/* Final Project Submission Card (End of Hackathon) */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Final Project Submission (Finish Hackathon)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Final submission for jury scoring and certificate qualification.
                </p>
              </div>

              {submission ? (
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {submission.submissionNumber}
                </span>
              ) : isDeadlinePassed ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-500/20 text-red-400">
                  Submission Closed
                </span>
              ) : (
                <Link
                  href="/dashboard/submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Project</span>
                </Link>
              )}
            </div>

            {submission ? (
              <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 space-y-2 text-xs">
                <p><strong className="text-white">Title:</strong> {submission.projectTitle}</p>
                <p className="text-muted-foreground line-clamp-2">{submission.projectDescription}</p>
                <div className="flex items-center gap-4 pt-2 text-red-400 font-mono text-[11px]">
                  <span>Status: {submission.status}</span>
                  <span>Submitted on: {formatDate(submission.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {isDeadlinePassed ? (
                  <p className="text-red-400">The final submission deadline has passed.</p>
                ) : (
                  <p>
                    Final project submission includes complete documentation, slide deck, repository, and impact statement.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Countdown, Squad, Owner Banking, and Announcements */}
        <div className="space-y-6">
          {/* Live Countdown Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Live Hackathon Deadlines
            </h3>

            <CountdownTimer
              submissionDeadline={hackathon.submissionDeadline.toISOString()}
              hackathonStartDate={hackathon.hackathonStartDate.toISOString()}
            />
          </div>

          {/* Owner Account & Payment Receipt Info Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-500" /> Payment & Billing
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  payment?.status === "SUCCESS"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {payment?.status === "SUCCESS" ? "PAID & CONFIRMED" : "PENDING APPROVAL"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee:</span>
                <span className="font-bold text-white">
                  {formatCurrency(registration?.feeAmount || hackathon.registrationFee, registration?.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Txn ID:</span>
                <span className="font-mono text-red-400 text-[11px]">
                  {payment?.transactionId || "TXN-CONFIRMED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTR / Payment Ref:</span>
                <span className="font-mono text-amber-400 text-[11px] font-bold">
                  {payment?.paymentId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway:</span>
                <span className="font-mono text-white text-[11px]">{payment?.gateway || "DIRECT_UPI"}</span>
              </div>
            </div>

            {/* Official Owner Beneficiary Details */}
            <div className="border-t border-[#30363D] pt-3 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Official Organizer Account Details
              </span>
              <p className="text-white font-semibold">{ownerAccount.owner_account_name}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>UPI ID:</span>
                <span className="font-mono text-red-400 font-bold">{ownerAccount.owner_upi_id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Bank:</span>
                <span className="text-white">{ownerAccount.owner_bank_name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Support:</span>
                <span className="text-white">{ownerAccount.owner_contact_phone}</span>
              </div>
            </div>
          </div>

          {/* Team Members List Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" /> Squad Roster ({team.members.length})
            </h3>

            <div className="space-y-2.5">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">
                      {member.name} {member.isLeader && "👑"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B22] text-red-400 border border-[#30363D]">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Feed Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" /> Official Announcements
            </h3>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent announcements.</p>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">{ann.title}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(ann.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{ann.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
