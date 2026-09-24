import ExportImportManager from "./ExportImportManager";

export const dynamic = "force-dynamic";

export default function AdminExportImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Data Export & Import Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Safely export the full multi-hackathon platform state as standardized JSON/CSV or import external datasets with schema validation.
        </p>
      </div>

      <ExportImportManager />
    </div>
  );
}
