import { SimpleMarketingPage } from "@/components/marketing/simple-page";
export default function CookieSettingsPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Datenschutz"
      title="Cookie-Einstellungen"
      text="Die technische Consent-Steuerung wird in Schritt 17 vervollständigt."
    >
      <div className="rounded-3xl border bg-white p-8">
        <h2 className="text-xl font-semibold">Notwendige Funktionen</h2>
        <p className="mt-3 text-slate-600">
          Sitzung und Sicherheitsfunktionen sind für den Betrieb erforderlich.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Optionale Dienste</h2>
        <p className="mt-3 text-slate-600">
          Derzeit sind keine optionalen Analyse-, Karten- oder Marketingdienste
          aktiv.
        </p>
      </div>
    </SimpleMarketingPage>
  );
}
