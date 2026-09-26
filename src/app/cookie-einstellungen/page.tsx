import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { getRequestOptionalServiceConfig } from "@/modules/consent/config";
import { CookieSettingsOverview } from "@/modules/legal/public-document";
export default async function CookieSettingsPage() {
  const optionalServiceConfig = await getRequestOptionalServiceConfig();
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Datenschutz"
      title="Cookie-Einstellungen"
      text="Optionale Kategorien lassen sich jederzeit anpassen oder widerrufen."
    >
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <CookieSettingsOverview optionalServices={optionalServiceConfig} />
      </div>
    </SimpleMarketingPage>
  );
}
