"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("System error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
            HTTP 500 — Processing Error
          </span>
          <h1 className="text-2xl font-extrabold text-white">Application Exception</h1>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          An unexpected server or runtime exception occurred during request execution. The technical error has been captured.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-white text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
