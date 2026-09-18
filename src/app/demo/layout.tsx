import { MaintenancePage } from "@/components/maintenance/maintenance-page";
import { env } from "@/config/env";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await findPlatformSettings();
  const maintenanceActive =
    settings?.maintenanceMode ||
    (env.DEMO_DATA_MODE === "database" && !settings);

  if (maintenanceActive && !settings?.demoAvailableDuringMaintenance) {
    return (
      <MaintenancePage
        accentColor={settings?.accentColor ?? "#0f172a"}
        brandName={settings?.brandName ?? "FahrSeiten – by ENJO MEDIA"}
        logoUrl={
          settings?.logoMediaId
            ? mediaPublicUrl(settings.logoMediaId)
            : undefined
        }
        message={
          settings?.maintenanceMessage ??
          "Hier entsteht die neue FahrSeiten-Plattform für moderne Fahrschulen."
        }
        primaryColor={settings?.primaryColor ?? "#0891b2"}
        showBrandName={settings?.showBrandName ?? true}
        variant="platform"
      />
    );
  }

  return children;
}
