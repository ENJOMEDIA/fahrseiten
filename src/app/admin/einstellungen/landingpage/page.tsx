import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

import { saveLandingpageSettings } from "./actions";

export default async function LandingpageSettingsPage() {
  await requirePlatformPermission("platform.security.manage");
  const settings = await findPlatformSettings();
  return (
    <CustomerPage
      title="Landingpage konfigurieren"
      description="Markenname und Grundfarben der öffentlichen FahrSeiten-Seite zentral verwalten."
    >
      <Card className="max-w-3xl">
        {settings ? (
          <form
            action={saveLandingpageSettings}
            className="grid gap-5 sm:grid-cols-2"
          >
            <label className="text-sm font-semibold sm:col-span-2">
              Angezeigter Markenname
              <input
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                defaultValue={settings.brandName}
                name="brandName"
                required
              />
            </label>
            <label className="text-sm font-semibold">
              Primärfarbe
              <input
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 p-1"
                defaultValue={settings.primaryColor}
                name="primaryColor"
                type="color"
              />
            </label>
            <label className="text-sm font-semibold">
              Akzentfarbe
              <input
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 p-1"
                defaultValue={settings.accentColor}
                name="accentColor"
                type="color"
              />
            </label>
            <div className="rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-950 sm:col-span-2">
              Wenn ein Seitenlogo vorhanden ist, zeigt der Header nur das Logo.
              Ohne Logo wird der Markenname ausgegeben. Logo und Favicon bleiben
              getrennt unter den{" "}
              <Link
                className="font-semibold underline"
                href="/admin/einstellungen"
              >
                Plattform-Einstellungen
              </Link>{" "}
              verwaltbar.
            </div>
            <button
              className="w-fit rounded-full bg-slate-950 px-6 py-3 font-semibold text-white"
              type="submit"
            >
              Landingpage speichern
            </button>
          </form>
        ) : (
          <p>Die Plattformstammdaten fehlen.</p>
        )}
      </Card>
    </CustomerPage>
  );
}
