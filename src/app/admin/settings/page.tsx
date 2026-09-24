import { prisma } from "@/lib/prisma";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Settings & Controls</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure payment gateway modes, live activity feeds, demo helper displays, and operational policies.
        </p>
      </div>

      <SettingsManager initialSettings={settingsMap} />
    </div>
  );
}
