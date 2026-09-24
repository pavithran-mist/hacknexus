"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, Settings, ShieldCheck, Zap } from "lucide-react";

export default function SettingsManager({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();

  const [platformName, setPlatformName] = useState(initialSettings.platform_name || "HackNexus");
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings.default_currency || "INR");
  const [paymentMode, setPaymentMode] = useState(initialSettings.payment_mode || "DEMO");
  const [demoModeEnabled, setDemoModeEnabled] = useState(initialSettings.demo_mode_enabled !== "false");
  const [activityPopupEnabled, setActivityPopupEnabled] = useState(initialSettings.activity_popup_enabled !== "false");
  const [showDemoActivity, setShowDemoActivity] = useState(initialSettings.show_demo_activity !== "false");
  const [judgeScoreVisibility, setJudgeScoreVisibility] = useState(initialSettings.judge_score_visibility || "ADMIN_ONLY");
  const [participantScoreVisibility, setParticipantScoreVisibility] = useState(initialSettings.participant_score_visibility || "AFTER_RESULTS");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        platform_name: platformName,
        default_currency: defaultCurrency,
        payment_mode: paymentMode,
        demo_mode_enabled: String(demoModeEnabled),
        activity_popup_enabled: String(activityPopupEnabled),
        show_demo_activity: String(showDemoActivity),
        judge_score_visibility: judgeScoreVisibility,
        participant_score_visibility: participantScoreVisibility,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update settings");
        setSubmitting(false);
        return;
      }

      setSuccess("Platform settings updated successfully!");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">
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

      {/* General Settings */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
          General Platform Branding
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Platform Title</label>
            <input
              type="text"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Default Currency</label>
            <input
              type="text"
              required
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Payment Gateway Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Payment Processing Architecture
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Default Payment Gateway Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="DEMO">DEMO PAYMENT (Clear simulated checkout)</option>
              <option value="RAZORPAY">RAZORPAY (Live production INR gateway)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="demoMode"
              checked={demoModeEnabled}
              onChange={(e) => setDemoModeEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="demoMode" className="text-xs text-white cursor-pointer select-none">
              Enable Demo Testing Helpers (Fast autofills on login forms)
            </label>
          </div>
        </div>
      </div>

      {/* Activity Notification Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Live Activity Notification Rules
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="popupEnabled"
              checked={activityPopupEnabled}
              onChange={(e) => setActivityPopupEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="popupEnabled" className="text-xs text-white cursor-pointer select-none">
              Enable Floating Activity Popup (Bottom-right live activity feed)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showDemo"
              checked={showDemoActivity}
              onChange={(e) => setShowDemoActivity(e.target.checked)}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="showDemo" className="text-xs text-white cursor-pointer select-none">
              Display Clearly Labeled Demo Activity in feed (Never fabricate fake real stats)
            </label>
          </div>
        </div>
      </div>

      {/* Score Visibility */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
          Judging & Score Visibility
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Jury Score Privacy</label>
            <select
              value={judgeScoreVisibility}
              onChange={(e) => setJudgeScoreVisibility(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="ADMIN_ONLY">Administrator Only</option>
              <option value="ALL_JUDGES">Visible to All Judges</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Participant Score Visibility</label>
            <select
              value={participantScoreVisibility}
              onChange={(e) => setParticipantScoreVisibility(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="AFTER_RESULTS">Visible Only After Results Announced</option>
              <option value="NEVER">Hidden (Feedback Only)</option>
              <option value="REALTIME">Live Scorecard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Saving Settings..." : "Save Platform Settings"}</span>
        </button>
      </div>
    </form>
  );
}
