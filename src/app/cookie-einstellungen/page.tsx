import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { OpenConsentSettingsButton } from "@/modules/consent/consent-manager";
import { OptionalContent } from "@/modules/consent/optional-content";
export default function CookieSettingsPage() {
  return (
    <SimpleMarketingPage
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
          Derzeit sind keine optionalen Analyse-, Karten- oder Marketingdienste
          aktiv. Künftige Dienste müssen die technische Freigabe ihrer Kategorie
          prüfen, bevor sie Daten übertragen oder externe Inhalte laden.
        </p>
        <div className="mt-8">
          <OpenConsentSettingsButton />
        </div>
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
