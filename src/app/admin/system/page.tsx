import { CustomerPage } from "@/components/customer/customer-page";
import { MigrationPanel } from "@/components/system/migration-panel";
import { readMigrationStatus } from "@/modules/operations/migration-status";
import { requirePlatformPermission } from "@/modules/platform/access";

import { runMigrationsAction } from "./actions";

export default async function SystemPage() {
  await requirePlatformPermission("platform.security.manage");
  const status = await readMigrationStatus();
  return (
    <CustomerPage
      title="Systemstatus"
      description="Datenbankschema, automatische Updates und technische Betriebszustände kontrollieren."
    >
      <MigrationPanel action={runMigrationsAction} status={status} />
    </CustomerPage>
  );
}
