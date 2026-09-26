import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPublishedPlatformLegalDocument } from "@/modules/legal/repository";
import { getOptionalServiceConfig } from "@/modules/consent/config";
import {
  LegalContent,
  PrivacyServiceNotice,
} from "@/modules/legal/public-document";
import {
  createOnlinebriefPrivacyNotice,
  createTrafficAnalyticsPrivacyNotice,
} from "@/modules/legal/documents";

const referralPrivacyNotice = `Empfehlungsprogramm\nWenn ein Interessent einen persönlichen Empfehlungslink verwendet, verarbeiten wir die zufällige Empfehlungskennung, die Zuordnung zum werbenden Kunden, den Zeitpunkt der Bestätigung, den Bearbeitungsstatus sowie – nach einem Vertragsschluss – die Kunden-, Vertrags-, Zahlungs- und Rechnungszuordnung. Der werbende Kunde erhält keine Kontaktdaten der empfohlenen Person. Die Verarbeitung dient der Bearbeitung der Anfrage, der Durchführung des Empfehlungsprogramms, der Missbrauchsvermeidung und der nachvollziehbaren Abrechnung. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b und lit. f DSGVO. Abrechnungsrelevante Nachweise werden entsprechend den gesetzlichen Aufbewahrungspflichten gespeichert; nicht zustande gekommene Empfehlungen werden gelöscht, sobald keine Nachweis- oder Abwehrinteressen mehr bestehen.`;

const newsletterPrivacyNotice = `Newsletter und Produktinformationen\nWenn eine ausdrückliche Einwilligung erteilt wurde, verarbeiten wir E-Mail-Adresse, Name, Unternehmen, Einwilligungszeitpunkt und Einwilligungsnachweis zum Versand von FahrSeiten-Newslettern und Produktinformationen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung kann jederzeit über den persönlichen Abmeldelink in jeder Nachricht mit Wirkung für die Zukunft widerrufen werden. Nach einem Widerruf wird die Adresse für weitere Werbe-E-Mails gesperrt; erforderliche Nachweise über Einwilligung und Widerruf werden nur so lange gespeichert, wie sie zur Erfüllung gesetzlicher Pflichten oder zur Rechtsverteidigung benötigt werden.`;

const postalTrackingPrivacyNotice = `Erfolgsmessung persönlicher Akquisebriefe\nZur Erfolgsmessung speichern wir leadbezogen Zeitpunkt des ersten und letzten Aufrufs sowie die Anzahl der QR-Link-Aufrufe. Wir speichern dafür keine IP-Adresse und erstellen keinen Gerätefingerabdruck. Die Auswertung nach Bundesland beruht ausschließlich auf der bereits in der Kundenakte hinterlegten Postleitzahl. Rechtsgrundlage ist unser berechtigtes Interesse an einer datensparsamen Erfolgsmessung gemäß Art. 6 Abs. 1 lit. f DSGVO. Der Verarbeitung kann jederzeit widersprochen werden.`;

const legacyAnalyticsPrivacyNotice = `Reichweitenmessung\nNach Einwilligung erfassen wir aufgerufenen Pfad, Hostname und Stunde des Aufrufs. IP-Adressen, vollständige User-Agents und dauerhafte Besucherprofile werden dabei nicht gespeichert. Die Werte werden nur stündlich zusammengefasst und nach 90 Tagen automatisch gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1 TDDDG. Die Einwilligung kann jederzeit über die Cookie-Einstellungen widerrufen werden.`;

export default async function PrivacyPage() {
  await connection();
  const [document, services] = await Promise.all([
    findPublishedPlatformLegalDocument("privacy").catch(() => null),
    getOptionalServiceConfig(),
  ]);
  const analyticsPrivacyNotice = createTrafficAnalyticsPrivacyNotice();
  const currentDocumentContent = document?.content.replace(
    legacyAnalyticsPrivacyNotice,
    analyticsPrivacyNotice,
  );
  const privacyContent = document
    ? [
        currentDocumentContent,
        currentDocumentContent?.includes("Onlinebrief24")
          ? null
          : createOnlinebriefPrivacyNotice(),
        currentDocumentContent?.includes("QR-Link-Aufrufe")
          ? null
          : postalTrackingPrivacyNotice,
        currentDocumentContent?.includes("Newsletter und Produktinformationen")
          ? null
          : newsletterPrivacyNotice,
        currentDocumentContent?.includes(
          "lokal auf unserem Server gespeicherten GeoIP-Datenbank",
        )
          ? null
          : analyticsPrivacyNotice,
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
        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <LegalContent content={privacyContent} title="Datenschutz" />
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
