"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, X, Check, AlertCircle } from "lucide-react";

interface PrototypeModalProps {
  teamId: string;
  existingPrototype?: {
    id: string;
    prototypeUrl: string;
    githubUrl: string;
    videoUrl?: string | null;
    projectDescription: string;
    technologies: string;
  } | null;
}

export default function PrototypeModalClient({
  teamId,
  existingPrototype,
}: PrototypeModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prototypeUrl, setPrototypeUrl] = useState(existingPrototype?.prototypeUrl || "");
  const [githubUrl, setGithubUrl] = useState(existingPrototype?.githubUrl || "");
  const [videoUrl, setVideoUrl] = useState(existingPrototype?.videoUrl || "");
  const [projectDescription, setProjectDescription] = useState(
    existingPrototype?.projectDescription || ""
  );
  const [technologies, setTechnologies] = useState(existingPrototype?.technologies || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/prototypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          prototypeUrl,
          githubUrl,
          videoUrl,
          projectDescription,
          technologies,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update prototype");
        setSubmitting(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted/50 border border-border text-xs text-white font-semibold transition-colors flex items-center gap-1.5"
      >
        <Code2 className="w-3.5 h-3.5 text-primary" />
        <span>{existingPrototype ? "Edit Deliverables" : "Submit Deliverables"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-white">Update Prototype Deliverables</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Prototype URL *</label>
                <input
                  type="url"
                  required
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  placeholder="https://myproject.vercel.app"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">GitHub Repository URL *</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/myteam/repo"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Demo Video Link</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Solution Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Briefly state your architecture and approach..."
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Technologies *</label>
                <input
                  type="text"
                  required
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Next.js, FastAPI, OpenCV, Redis"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold hover:bg-muted/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Prototype"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
