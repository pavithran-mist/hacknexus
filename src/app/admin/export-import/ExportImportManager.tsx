"use client";

import { useState } from "react";
import { Download, Upload, CheckCircle2, AlertCircle, FileJson, FileSpreadsheet, Eye, ShieldCheck } from "lucide-react";

export default function ExportImportManager() {
  const [downloading, setDownloading] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleDownloadJSON = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/export?format=json");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hacknexus-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export JSON");
    } finally {
      setDownloading(false);
    }
  };

  const handleValidateJSON = async () => {
    setError("");
    setMessage("");
    setPreviewData(null);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: parsed, confirm: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Validation failed");
        return;
      }
      setPreviewData(data.preview);
    } catch {
      setError("Malformed JSON string. Please provide valid JSON syntax.");
    }
  };

  const handleConfirmImport = async () => {
    setError("");
    setMessage("");
    setImporting(true);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: parsed, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        setImporting(false);
        return;
      }
      setMessage(data.message || "Import completed successfully!");
      setPreviewData(null);
      setImportJson("");
    } catch {
      setError("An unexpected error occurred during import.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: EXPORT */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Download className="w-5 h-5" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Export Platform Dataset
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Generates a sanitized cryptographic snapshot of current database state. In accordance with platform security protocols, <strong>user password hashes, payment private tokens, and API secrets are strictly omitted</strong> from the export payload.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={handleDownloadJSON}
            disabled={downloading}
            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            <span>{downloading ? "Generating..." : "Download Complete JSON Backup"}</span>
          </button>

          <a
            href="/api/admin/export?format=csv"
            className="px-5 py-3 rounded-xl bg-[#111827] hover:bg-muted/40 border border-border text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Squads & Registrations (CSV)</span>
          </a>
        </div>
      </div>

      {/* SECTION 2: IMPORT */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-blue-400">
          <Upload className="w-5 h-5" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Import Dataset
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paste a previously exported JSON dataset below. HackNexus will inspect the schema and render an entity count preview before prompting for final confirmation.
        </p>

        <div className="space-y-2">
          <textarea
            rows={6}
            placeholder='Paste JSON backup here: { "platform": {}, "hackathons": [...] }'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="w-full bg-[#111827] border border-border rounded-xl p-4 text-xs text-white font-mono focus:outline-none focus:border-primary"
          />

          <div className="flex justify-end">
            <button
              onClick={handleValidateJSON}
              disabled={!importJson.trim()}
              className="px-4 py-2 rounded-lg bg-card hover:bg-muted/40 border border-border text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Validate & Inspect Dataset</span>
            </button>
          </div>
        </div>

        {/* Preview Confirmation Card */}
        {previewData && (
          <div className="p-5 rounded-xl bg-[#111827] border border-primary/40 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Dataset Schema Validated — Preview Summary</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.hackathons}</span>
                <span className="text-[10px] text-muted-foreground">Hackathons</span>
              </div>
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.themes}</span>
                <span className="text-[10px] text-muted-foreground">Themes</span>
              </div>
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.problems}</span>
                <span className="text-[10px] text-muted-foreground">Problems</span>
              </div>
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.teams}</span>
                <span className="text-[10px] text-muted-foreground">Teams</span>
              </div>
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.payments}</span>
                <span className="text-[10px] text-muted-foreground">Payments</span>
              </div>
              <div className="p-2.5 rounded bg-card border border-border">
                <span className="text-white font-bold block">{previewData.submissions}</span>
                <span className="text-[10px] text-muted-foreground">Submissions</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300">
              ⚠️ <strong>Confirmation Required:</strong> Existing records will be safely updated without wiping unreferenced tables. Proceed to commit changes to database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {importing ? "Importing Records..." : "Confirm & Write to Database"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
