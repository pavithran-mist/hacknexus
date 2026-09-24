"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

interface FinalSubmissionFormProps {
  teamId: string;
  hackathonId: string;
  existingSubmission?: any;
  prototype?: any;
}

const STAGES = [
  { id: "SCANNING", label: "Scanning Project Deliverables" },
  { id: "EXTRACTING", label: "Extracting Repository & Metadata" },
  { id: "VALIDATING", label: "Validating URLs & Documentation Links" },
  { id: "MAPPING", label: "Mapping to Evaluation Rubric" },
  { id: "COMPLETED", label: "Submission Verified & Recorded" },
];

export default function FinalSubmissionForm({
  teamId,
  hackathonId,
  existingSubmission,
  prototype,
}: FinalSubmissionFormProps) {
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState(
    existingSubmission?.projectTitle || ""
  );
  const [projectDescription, setProjectDescription] = useState(
    existingSubmission?.projectDescription || prototype?.projectDescription || ""
  );
  const [prototypeUrl, setPrototypeUrl] = useState(
    existingSubmission?.prototypeUrl || prototype?.prototypeUrl || ""
  );
  const [githubUrl, setGithubUrl] = useState(
    existingSubmission?.githubUrl || prototype?.githubUrl || ""
  );
  const [demoVideoUrl, setDemoVideoUrl] = useState(
    existingSubmission?.demoVideoUrl || prototype?.videoUrl || ""
  );
  const [pptUrl, setPptUrl] = useState(
    existingSubmission?.pptUrl || "https://slides.google.com/presentation/d/my-deck"
  );
  const [documentationUrl, setDocumentationUrl] = useState(
    existingSubmission?.documentationUrl || "https://docs.myproject.internal"
  );
  const [technologies, setTechnologies] = useState(
    existingSubmission?.technologies || prototype?.technologies || ""
  );
  const [expectedImpact, setExpectedImpact] = useState(
    existingSubmission?.expectedImpact ||
      "Reduces target process turnaround time by 60% with verifiable accuracy gains."
  );
  const [futureScope, setFutureScope] = useState(
    existingSubmission?.futureScope ||
      "Enterprise multi-tenant deployment, automated model retraining pipeline, and localized mobile integration."
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Processing Animation Experience state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [speed, setSpeed] = useState<"fast" | "normal" | "slow">("normal");
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectTitle || !projectDescription || !prototypeUrl || !githubUrl) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setIsProcessing(true);
    setCurrentStageIndex(0);
    setElapsedSeconds(0);

    const speedIntervals = {
      fast: 300,
      normal: 800,
      slow: 1500,
    };
    const stepDuration = speedIntervals[speed];

    // Processing animation ticker
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    for (let i = 0; i < STAGES.length - 1; i++) {
      setCurrentStageIndex(i);
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }

    try {
      // Real database submission
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          hackathonId,
          projectTitle,
          projectDescription,
          prototypeUrl,
          githubUrl,
          demoVideoUrl,
          pptUrl,
          documentationUrl,
          technologies,
          expectedImpact,
          futureScope,
        }),
      });

      const data = await res.json();
      clearInterval(timerInterval);

      if (!res.ok) {
        setError(data.error || "Submission failed");
        setIsProcessing(false);
        setSubmitting(false);
        return;
      }

      setCurrentStageIndex(4); // COMPLETED
      setSubmittedData(data.submission);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch {
      clearInterval(timerInterval);
      setError("An unexpected network error occurred.");
      setIsProcessing(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* PROCESSING EXPERIENCE MODAL */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-center relative overflow-hidden">
            {/* Speed toggle for demo feedback */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-primary" /> Processing Speed:
              </span>
              <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-border">
                {(["fast", "normal", "slow"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      speed === s ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Stage Display */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                {currentStageIndex === 4 ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <Sparkles className="w-7 h-7 animate-pulse" />
                )}
              </div>
              <span className="font-mono text-xs font-bold text-teal-400 uppercase tracking-wider block">
                STAGE {currentStageIndex + 1} OF 5: {STAGES[currentStageIndex].id}
              </span>
              <h3 className="text-xl font-bold text-white">
                {STAGES[currentStageIndex].label}
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-[#111827] rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStageIndex + 1) / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Progress: {Math.round(((currentStageIndex + 1) / 5) * 100)}%</span>
                <span>Elapsed: {elapsedSeconds}s</span>
              </div>
            </div>

            {/* Simulation disclosure */}
            <p className="text-[11px] text-muted-foreground italic">
              Simulated UI feedback journey. All deliverables are directly recorded into the HackNexus database for jury scoring.
            </p>

            {currentStageIndex === 4 && submittedData && (
              <div className="pt-2 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  Assigned Submission ID: <strong>{submittedData.submissionNumber}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProcessing(false);
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Final Project Title *</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. AegisAI — Real-Time Emergency Detection"
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Comprehensive Project Description *</label>
            <textarea
              rows={4}
              required
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Explain the full problem, your novel architecture, algorithms, and key results..."
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Live Prototype URL *</label>
              <input
                type="url"
                required
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                placeholder="https://myproject.vercel.app"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">GitHub Repository URL *</label>
              <input
                type="url"
                required
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/team/repo"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Demo Video URL</label>
              <input
                type="url"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Presentation Slide Deck URL (PPT/Drive)</label>
              <input
                type="url"
                value={pptUrl}
                onChange={(e) => setPptUrl(e.target.value)}
                placeholder="https://slides.google.com/..."
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Technical Documentation URL</label>
            <input
              type="url"
              value={documentationUrl}
              onChange={(e) => setDocumentationUrl(e.target.value)}
              placeholder="https://docs.myproject.internal"
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">Complete Technologies & Libraries *</label>
            <input
              type="text"
              required
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="PyTorch, Next.js, Redis, Docker, FastAPI"
              className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Expected Real-World Impact *</label>
              <textarea
                rows={3}
                required
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder="How does this solution positively impact target beneficiaries?"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Future Scope & Scalability *</label>
              <textarea
                rows={3}
                required
                value={futureScope}
                onChange={(e) => setFutureScope(e.target.value)}
                placeholder="Next steps, commercialization feasibility, and edge scalability..."
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Trophy className="w-4 h-4" />
            <span>Submit Deliverable for Judging</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </>
  );
}
