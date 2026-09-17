import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { OpenConsentSettingsButton } from "@/modules/consent/consent-manager";
import { OptionalContent } from "@/modules/consent/optional-content";
import { getOptionalServiceConfig } from "@/modules/consent/config";
export default function CookieSettingsPage() {
  const optionalServiceConfig = getOptionalServiceConfig();
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Datenschutz"
      title="Cookie-Einstellungen"
      text="Optionale Kategorien lassen sich jederzeit anpassen oder widerrufen."
    >
      <div className="rounded-3xl border bg-white p-8">
        <h2 className="text-xl font-semibold">Notwendige Funktionen</h2>
        <p className="mt-3 text-slate-600">
          Sitzung und Sicherheitsfunktionen sind für den Betrieb erforderlich.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Optionale Dienste</h2>
        <p className="mt-3 text-slate-600">
          {optionalServiceConfig.length === 0
            ? "Derzeit sind keine optionalen Analyse-, Karten- oder Marketingdienste aktiv. Deshalb wird auch keine unnötige Einwilligung abgefragt."
            : "Die nachfolgend aufgeführten Dienste werden erst nach einer passenden Einwilligung geladen."}
        </p>
        {optionalServiceConfig.length > 0 ? (
          <ul className="mt-5 list-disc pl-6">
            {optionalServiceConfig.map((item) => (
              <li key={item.category}>
                <strong>{item.label}:</strong> {item.services}
              </li>
            ))}
          </ul>
        ) : null}
        {optionalServiceConfig.length > 0 ? (
          <div className="mt-8">
            <OpenConsentSettingsButton />
          </div>
        ) : null}
        <div className="mt-8">
          <OptionalContent
            category="functional"
            title="Beispiel für externe Karte"
          >
            <div className="rounded-2xl bg-cyan-50 p-5">
              Funktionaler Inhalt freigegeben. In der lokalen Entwicklung ist
              kein externer Kartenanbieter verbunden.
            </div>
          </OptionalContent>
        </div>
      </div>
    </SimpleMarketingPage>
  );
}
