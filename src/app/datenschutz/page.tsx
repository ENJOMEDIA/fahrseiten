import { SimpleMarketingPage } from "@/components/marketing/simple-page";
export default function PrivacyPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Rechtliches"
      title="Datenschutz"
      text="Technischer Entwurf – kein final freigegebener Rechtstext."
    >
      <article className="prose max-w-none rounded-3xl border bg-white p-8">
        <h2>Aktueller lokaler Stand</h2>
        <p>
          Im Entwicklungsbetrieb werden ausschließlich fiktive Testdaten
          verwendet. Kontakt- und Beratungsformulare speichern Testangaben
          getrennt nach ihrem Zielkontext.
        </p>
        <h2>Einwilligungsversion</h2>
        <p>
          Die aktuelle technische Auswahl verwendet die Version „consent-v1“.
          Notwendige Funktionen sind dauerhaft aktiv; funktionale, Statistik-
          und Marketingdienste bleiben ohne passende Zustimmung blockiert. Die
          Auswahl kann über die Cookie-Einstellungen widerrufen werden.
        </p>
        <h2>Vor Veröffentlichung offen</h2>
        <p>
          Verantwortlicher, Rechtsgrundlagen, Empfänger, Aufbewahrungsfristen,
          Betroffenenrechte, Hosting, SMTP und weitere Unterauftragnehmer müssen
          verbindlich ergänzt und rechtlich geprüft werden.
        </p>
      </article>
    </SimpleMarketingPage>
  );
}
