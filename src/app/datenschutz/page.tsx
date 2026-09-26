import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPublishedPlatformLegalDocument } from "@/modules/legal/repository";
import { getOptionalServiceConfig } from "@/modules/consent/config";
import { PrivacyServiceNotice } from "@/modules/legal/public-document";
import { createOnlinebriefPrivacyNotice } from "@/modules/legal/documents";

const referralPrivacyNotice = `Empfehlungsprogramm\nWenn ein Interessent einen persönlichen Empfehlungslink verwendet, verarbeiten wir die zufällige Empfehlungskennung, die Zuordnung zum werbenden Kunden, den Zeitpunkt der Bestätigung, den Bearbeitungsstatus sowie – nach einem Vertragsschluss – die Kunden-, Vertrags-, Zahlungs- und Rechnungszuordnung. Der werbende Kunde erhält keine Kontaktdaten der empfohlenen Person. Die Verarbeitung dient der Bearbeitung der Anfrage, der Durchführung des Empfehlungsprogramms, der Missbrauchsvermeidung und der nachvollziehbaren Abrechnung. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b und lit. f DSGVO. Abrechnungsrelevante Nachweise werden entsprechend den gesetzlichen Aufbewahrungspflichten gespeichert; nicht zustande gekommene Empfehlungen werden gelöscht, sobald keine Nachweis- oder Abwehrinteressen mehr bestehen.`;

const newsletterPrivacyNotice = `Newsletter und Produktinformationen\nWenn eine ausdrückliche Einwilligung erteilt wurde, verarbeiten wir E-Mail-Adresse, Name, Unternehmen, Einwilligungszeitpunkt und Einwilligungsnachweis zum Versand von FahrSeiten-Newslettern und Produktinformationen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung kann jederzeit über den persönlichen Abmeldelink in jeder Nachricht mit Wirkung für die Zukunft widerrufen werden. Nach einem Widerruf wird die Adresse für weitere Werbe-E-Mails gesperrt; erforderliche Nachweise über Einwilligung und Widerruf werden nur so lange gespeichert, wie sie zur Erfüllung gesetzlicher Pflichten oder zur Rechtsverteidigung benötigt werden.`;

export default async function PrivacyPage() {
  await connection();
  const [document, services] = await Promise.all([
    findPublishedPlatformLegalDocument("privacy").catch(() => null),
    getOptionalServiceConfig(),
  ]);
  const privacyContent = document
    ? [
        document.content,
        document.content.includes("Onlinebrief24")
          ? null
          : createOnlinebriefPrivacyNotice(),
        document.content.includes("Newsletter und Produktinformationen")
          ? null
          : newsletterPrivacyNotice,
        referralPrivacyNotice,
      ]
        .filter(Boolean)
        .join("\n\n")
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
