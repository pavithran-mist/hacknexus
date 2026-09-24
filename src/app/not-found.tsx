import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider">
            HTTP 404 — Record Missing
          </span>
          <h1 className="text-2xl font-extrabold text-white">Resource Not Found</h1>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The requested hackathon challenge, team profile, or endpoint could not be located in the HackNexus database.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
