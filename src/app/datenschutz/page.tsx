import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPublishedPlatformLegalDocument } from "@/modules/legal/repository";
import { getOptionalServiceConfig } from "@/modules/consent/config";
import { PrivacyServiceNotice } from "@/modules/legal/public-document";
import { createOnlinebriefPrivacyNotice } from "@/modules/legal/documents";

export default async function PrivacyPage() {
  await connection();
  const [document, services] = await Promise.all([
    findPublishedPlatformLegalDocument("privacy").catch(() => null),
    getOptionalServiceConfig(),
  ]);
  const privacyContent = document
    ? document.content.includes("Onlinebrief24")
      ? document.content
      : `${document.content}\n\n${createOnlinebriefPrivacyNotice()}`
    : null;
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Rechtliches"
      title="Datenschutz"
      text="Informationen zur Verarbeitung personenbezogener Daten auf der FahrSeiten-Plattform."
    >
      {privacyContent ? (
        <article className="rounded-3xl border bg-white p-8 leading-7 whitespace-pre-wrap text-slate-700">
          {privacyContent}
          <PrivacyServiceNotice services={services} />
        </article>
      ) : (
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
            Betroffenenrechte, Hosting, SMTP und weitere Unterauftragnehmer
            müssen verbindlich ergänzt und rechtlich geprüft werden.
          </p>
        </article>
      )}
    </SimpleMarketingPage>
  );
}
