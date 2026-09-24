"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, Globe, Sparkles } from "lucide-react";

export default function CMSManager({
  initialContent,
  hackathonId,
}: {
  initialContent: any | null;
  hackathonId: string;
}) {
  const router = useRouter();

  const [heroTitle, setHeroTitle] = useState(
    initialContent?.heroTitle || "Turn Your Ideas Into Innovation"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    initialContent?.heroSubtitle ||
      "Build bold solutions. Collaborate with brilliant teams. Compete on a platform designed for modern hackathons."
  );
  const [aboutText, setAboutText] = useState(
    initialContent?.aboutText ||
      "HackNexus is the premier high-performance platform powering next-generation competitive technology sprints."
  );
  const [rulesText, setRulesText] = useState(
    initialContent?.rulesText ||
      "1. All team members must be enrolled students or professionals.\n2. Projects must be built during the official competition window.\n3. Open-source libraries are permitted; pre-existing closed source solutions are strictly prohibited."
  );
  const [contactEmail, setContactEmail] = useState(
    initialContent?.contactEmail || "contact@hacknexus.io"
  );
  const [contactPhone, setContactPhone] = useState(
    initialContent?.contactPhone || "+91 80000 12345"
  );
  const [footerText, setFooterText] = useState(
    initialContent?.footerText || "© 2026 HackNexus. All rights reserved. Built for builders."
  );

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          heroTitle,
          heroSubtitle,
          aboutText,
          rulesText,
          contactEmail,
          contactPhone,
          footerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update content");
        setSubmitting(false);
        return;
      }

      setSuccess("Website content updated! Changes are immediately live on the public landing page.");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 text-xs">
        <div>
          <label className="text-teal-400 block mb-1 font-bold">Homepage Hero Headline *</label>
          <input
            type="text"
            required
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-sm font-extrabold text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Hero Subtitle *</label>
          <textarea
            rows={2}
            required
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">About / Mission Statement</label>
          <textarea
            rows={3}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">
            Competition Rules (One rule per line)
          </label>
          <textarea
            rows={5}
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Support Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Support Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-muted-foreground block mb-1 font-medium">Footer Copyright Text</label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Publishing Changes..." : "Publish Website Content"}</span>
        </button>
      </div>
    </form>
  );
}
