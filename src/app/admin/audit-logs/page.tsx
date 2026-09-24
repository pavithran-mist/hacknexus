import { prisma } from "@/lib/prisma";
import AuditLogsManager from "./AuditLogsManager";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Security & Administrative Audit Logs</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Immutable audit record of all administrative logins, fee modifications, payment adjustments, and status changes.
        </p>
      </div>

      <AuditLogsManager initialLogs={logs} />
    </div>
  );
}
