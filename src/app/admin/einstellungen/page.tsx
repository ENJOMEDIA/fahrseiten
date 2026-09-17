import { CustomerPage } from "@/components/customer/customer-page";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

import { savePlatformMaintenance } from "./actions";

export default async function PlatformSettingsPage() {
  await requirePlatformPermission("platform.security.manage");
  const settings = await findPlatformSettings();
  return (
    <CustomerPage
      title="Plattform-Einstellungen"
      description="Öffentliche FahrSeiten-Seite kontrolliert freigeben oder als Vorschau anzeigen."
    >
      {settings ? (
        <form
          action={savePlatformMaintenance}
          className="max-w-2xl space-y-5 rounded-2xl border bg-white p-6"
        >
          <label className="flex items-start gap-3 font-semibold">
            <input
              className="mt-1 size-5"
              defaultChecked={settings.maintenanceMode}
              name="enabled"
              type="checkbox"
            />
            <span>
              Wartungsmodus aktiv
              <span className="mt-1 block text-sm font-normal text-slate-600">
                Die öffentliche Hauptseite zeigt eine Vorschau. Administration
                und Installer bleiben erreichbar.
              </span>
            </span>
          </label>
          <label className="block text-sm font-semibold">
            Vorschautext
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border p-3 font-normal"
              defaultValue={settings.maintenanceMessage}
              maxLength={500}
              minLength={10}
              name="message"
              required
            />
          </label>
          <button
            className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
            type="submit"
          >
            Einstellung speichern
          </button>
        </form>
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die Plattformstammdaten fehlen. Führe zuerst den Webinstaller aus.
        </p>
      )}
    </CustomerPage>
  );
}
