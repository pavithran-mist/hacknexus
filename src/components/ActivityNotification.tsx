"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  actorEmail?: string | null;
  action: string;
  entity: string;
  metadata?: string | null;
  isDemo: boolean;
  timestamp: string;
}

export default function ActivityNotification() {
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          if (data.enabled && data.activities && data.activities.length > 0) {
            // Pick a random recent activity
            const randomIndex = Math.floor(Math.random() * data.activities.length);
            const selected = data.activities[randomIndex];
            setCurrentActivity(selected);
            setVisible(true);

            // Hide after 6 seconds
            timeoutId = setTimeout(() => {
              setVisible(false);
            }, 6000);
          }
        }
      } catch (e) {
        // Silently catch background activity errors
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 25000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!visible || !currentActivity) return null;

  let metadataObj: any = {};
  try {
    if (currentActivity.metadata) {
      metadataObj = JSON.parse(currentActivity.metadata);
    }
  } catch {
    // Ignore parse error
  }

  // Format human-readable action text
  const formatActionText = () => {
    switch (currentActivity.action) {
      case "TEAM_REGISTERED":
        return `Team "${metadataObj.teamName || "Innovators"}" registered for the hackathon`;
      case "PAYMENT_COMPLETED":
        return `Registration fee confirmed for ${metadataObj.teamName || "a new team"}`;
      case "PROTOTYPE_SUBMITTED":
        return `A new prototype link was submitted by ${metadataObj.teamName || "a team"}`;
      case "FINAL_SUBMISSION_COMPLETED":
        return `Final project "${metadataObj.projectTitle || "Project"}" was submitted`;
      case "SUBMISSION_EVALUATED":
        return `Jury completed evaluation for ${metadataObj.teamName || "a project"}`;
      case "HACKATHON_CREATED":
        return `New hackathon "${metadataObj.name || "Competition"}" launched`;
      default:
        return `${currentActivity.action.replace(/_/g, " ").toLowerCase()}`;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-xl p-3.5 flex items-start gap-3 relative overflow-hidden">
        {/* Accent glow bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            currentActivity.isDemo ? "bg-amber-500" : "bg-primary"
          }`}
        />

        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            currentActivity.isDemo
              ? "bg-amber-500/10 text-amber-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          {currentActivity.isDemo ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            {currentActivity.isDemo ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                Demo Activity
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.2 rounded border border-primary/30">
                Live Activity
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {new Date(currentActivity.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-xs font-medium text-foreground line-clamp-2">
            {formatActionText()}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
