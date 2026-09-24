"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  ArrowLeft,
  QrCode,
  Download,
  Copy,
} from "lucide-react";

interface CertificateProps {
  cert: {
    certificateId: string;
    teamName: string;
    projectTitle: string;
    college: string;
    themeName: string;
    hackathonName: string;
    award: string;
    isWinner: boolean;
    rank: number | null;
    members: Array<{ name: string; role: string; isLeader: boolean }>;
    issuedDate: string;
  };
}

export default function CertificateViewerClient({ cert }: CertificateProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white py-10 px-4 sm:px-6">
      {/* Non-printable Action Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-sm"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Share Verification Link"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div
        id="certificate-print-area"
        className="max-w-5xl mx-auto bg-gradient-to-br from-[#12161F] via-[#161B22] to-[#0D1117] border-8 border-double border-red-600/60 rounded-3xl p-8 sm:p-14 relative shadow-2xl overflow-hidden print:m-0 print:p-8 print:border-4 print:shadow-none print:bg-white print:text-black"
      >
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Trophy className="w-96 h-96 text-red-500" />
        </div>

        {/* Certificate Header */}
        <div className="text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest print:border-red-600 print:text-red-700">
            <ShieldCheck className="w-4 h-4" /> Official Verified Certificate
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase print:text-gray-900 font-serif">
            Certificate of Excellence
          </h1>

          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-red-400 print:text-red-700">
            {cert.hackathonName}
          </p>

          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto my-3" />
        </div>

        {/* Certificate Body */}
        <div className="my-10 text-center relative z-10 space-y-6 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest print:text-gray-600">
            This certifies that the team
          </p>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide uppercase text-red-500 print:text-red-700">
            {cert.teamName}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 font-medium print:text-gray-800">
            from <span className="font-bold text-white print:text-black">{cert.college}</span>, comprising members:
          </p>

          {/* Members list */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
            {cert.members.map((m, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#21262D] border border-[#30363D] text-xs font-semibold text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black"
              >
                {m.name} {m.isLeader && <span className="text-red-400 font-bold">(Leader)</span>}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed print:text-gray-800">
            has successfully innovated, developed, and submitted their high-impact prototype project{" "}
            <span className="font-bold text-white print:text-black">&quot;{cert.projectTitle}&quot;</span> under the{" "}
            <span className="text-red-400 font-semibold print:text-red-700">{cert.themeName}</span>.
          </p>

          {/* Award Distinction Banner */}
          <div className="py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600/20 via-red-600/30 to-red-600/20 border border-red-500/40 inline-block shadow-inner print:border-red-600 print:bg-red-50">
            <span className="text-[11px] uppercase font-bold text-gray-400 block tracking-wider print:text-gray-600">
              Honorable Distinction
            </span>
            <span className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase text-red-400 print:text-red-700">
              🏆 {cert.award}
            </span>
          </div>
        </div>

        {/* Certificate Footer: Signatures & Verification */}
        <div className="mt-12 pt-8 border-t border-[#30363D] relative z-10 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 text-center sm:text-left print:border-gray-400">
          {/* Signature 1 */}
          <div className="space-y-1">
            <div className="h-10 border-b border-gray-600 w-36 mx-auto sm:mx-0 flex items-center justify-center font-serif italic text-red-400 text-lg">
              Dr. Arvind Menon
            </div>
            <p className="text-xs font-bold text-white print:text-black">Dr. Arvind Menon</p>
            <p className="text-[10px] text-muted-foreground print:text-gray-600 uppercase">
              Hackathon Director, HackNexus
            </p>
          </div>

          {/* Center QR & Seal */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <div className="font-mono text-[9px] text-red-400 font-bold uppercase print:text-red-700">
              ID: {cert.certificateId}
            </div>
            <p className="text-[9px] text-muted-foreground print:text-gray-500">
              Issued: {cert.issuedDate}
            </p>
          </div>

          {/* Signature 2 */}
          <div className="space-y-1 text-center sm:text-right">
            <div className="h-10 border-b border-gray-600 w-36 mx-auto sm:ml-auto sm:mr-0 flex items-center justify-center font-serif italic text-red-400 text-lg">
              Priya Swaminathan
            </div>
            <p className="text-xs font-bold text-white print:text-black">Priya Swaminathan</p>
            <p className="text-[10px] text-muted-foreground print:text-gray-600 uppercase">
              Chief Evaluation Jury Officer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
