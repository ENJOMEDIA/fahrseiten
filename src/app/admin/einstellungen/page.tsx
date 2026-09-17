import Image from "next/image";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { MaintenanceForm } from "@/components/setup/maintenance-form";
import { platformHasPublishedLegalDocuments } from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

import { mediaPublicUrl } from "@/modules/media/public-url";

import { savePlatformMaintenance } from "./actions";
import { uploadPlatformLogo } from "./branding-actions";

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
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <MaintenanceForm
            action={savePlatformMaintenance}
            legalHref="/admin/rechtliches"
            legalReady={legalReady}
            maintenanceMessage={settings.maintenanceMessage}
            maintenanceMode={settings.maintenanceMode}
          />
          <Card className="h-fit">
            <h2 className="font-semibold">Markenlogo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Das Logo erscheint auf der Hauptseite und kann später über die
              Medien-Subdomain ausgeliefert werden.
            </p>
            {settings.logoMediaId ? (
              <div className="relative mt-5 h-28 overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  alt="Aktuelles FahrSeiten Logo"
                  className="object-contain p-4"
                  fill
                  src={mediaPublicUrl(settings.logoMediaId)}
                  unoptimized
                />
              </div>
            ) : null}
            <form action={uploadPlatformLogo} className="mt-5 space-y-4">
              <input
                accept="image/png,image/jpeg,image/webp"
                className="block w-full text-sm"
                name="file"
                required
                type="file"
              />
              <button
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
                type="submit"
              >
                Logo hochladen
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              PNG, JPEG oder WebP · maximal 8 MB
            </p>
          </Card>
        </div>
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die Plattformstammdaten fehlen. Führe zuerst den Webinstaller aus.
        </p>
      )}
    </CustomerPage>
  );
}
