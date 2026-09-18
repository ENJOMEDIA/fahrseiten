import Link from "next/link";
import { connection } from "next/server";

import { MarketingHero, MarketingShell } from "./marketing-shell";
import { MaintenancePage } from "@/components/maintenance/maintenance-page";
import { env } from "@/config/env";
import { dashboardUrl } from "@/config/dashboard-url";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
import { mediaPublicUrl } from "@/modules/media/public-url";

function MaintenanceLegalShell({
  brandName,
  children,
}: {
  brandName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-5">
          <Link className="font-semibold tracking-tight" href="/">
            {brandName}
          </Link>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            Im Aufbau
          </span>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200 px-6 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-3">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/cookie-einstellungen">Cookie-Einstellungen</Link>
          <Link className="font-semibold text-slate-950" href={dashboardUrl()}>
            Kundenlogin
          </Link>
        </div>
      </footer>
    </div>
  );
}

export async function SimpleMarketingPage({
  eyebrow,
  title,
  text,
  children,
  availableDuringMaintenance = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: React.ReactNode;
  availableDuringMaintenance?: boolean;
}) {
  await connection();
  const settings = await findPlatformSettings();
  const maintenanceActive =
    settings?.maintenanceMode ||
    (env.DEMO_DATA_MODE === "database" && !settings);
  if (maintenanceActive && !availableDuringMaintenance) {
    return (
      <MaintenancePage
        accentColor={settings?.accentColor ?? "#0f172a"}
        brandName={settings?.brandName ?? "FahrSeiten – by ENJO MEDIA"}
        message={
          settings?.maintenanceMessage ??
          "Hier entsteht die neue FahrSeiten-Plattform für moderne Fahrschulen."
        }
        logoUrl={
          settings?.logoMediaId
            ? mediaPublicUrl(settings.logoMediaId)
            : undefined
        }
        primaryColor={settings?.primaryColor ?? "#0891b2"}
        variant="platform"
        demoHref={
          settings?.demoAvailableDuringMaintenance ? "/demo" : undefined
        }
      />
    );
  }

  const page = (
    <main>
      <MarketingHero eyebrow={eyebrow} title={title} text={text} />
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">{children}</div>
      </section>
    </main>
  );
  return maintenanceActive ? (
    <MaintenanceLegalShell brandName={settings?.brandName ?? "FahrSeiten"}>
      {page}
    </MaintenanceLegalShell>
  ) : (
    <MarketingShell
      brandName={settings?.brandName}
      logoUrl={
        settings?.logoMediaId ? mediaPublicUrl(settings.logoMediaId) : undefined
      }
    >
      {page}
    </MarketingShell>
  );
}
