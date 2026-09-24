import Link from "next/link";
import { ShieldAlert, ArrowLeft, KeyRound } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/30 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider">
            HTTP 403 — Clearance Denied
          </span>
          <h1 className="text-2xl font-extrabold text-white">Access Forbidden</h1>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your current account role does not possess the requisite administrative or jury credentials to view this resource.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-white text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
