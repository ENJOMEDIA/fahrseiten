import { CustomerPage } from "@/components/customer/customer-page";
import { MaintenanceForm } from "@/components/setup/maintenance-form";
import { platformHasPublishedLegalDocuments } from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

import { savePlatformMaintenance } from "./actions";

export default async function PlatformSettingsPage() {
  await requirePlatformPermission("platform.security.manage");
  const [settings, legalReady] = await Promise.all([
    findPlatformSettings(),
    platformHasPublishedLegalDocuments(),
  ]);
  return (
    <CustomerPage
      title="Plattform-Einstellungen"
      description="Öffentliche FahrSeiten-Seite kontrolliert freigeben oder als Vorschau anzeigen."
    >
      {settings ? (
        <MaintenanceForm
          action={savePlatformMaintenance}
          legalHref="/admin/rechtliches"
          legalReady={legalReady}
          maintenanceMessage={settings.maintenanceMessage}
          maintenanceMode={settings.maintenanceMode}
        />
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die Plattformstammdaten fehlen. Führe zuerst den Webinstaller aus.
        </p>
      )}
    </CustomerPage>
  );
}
