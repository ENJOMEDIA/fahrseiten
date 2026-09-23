export type ContractTemplateInput = {
  brandLogoPng?: Uint8Array;
  contractNumber: string;
  customerNumber: string;
  provider: {
    companyName: string;
    representativeName: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    email: string;
  };
  customer: {
    companyName: string;
    recipientName?: string | null;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    email: string;
  };
  packageName: string;
  monthlyPriceCents: number | null;
  setupPriceCents: number | null;
  startsAt: Date;
  minimumTermMonths: number;
  cancellationNoticeMonths: number;
  renewsIndefinitely: boolean;
  billingIntervalMonths: number;
  billingAmountCents: number | null;
  discountBasisPoints: number;
  nextInvoiceAt?: Date | null;
};

export type ContractSection = { heading: string; paragraphs: string[] };

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" });

export function createContractSections(
  input: ContractTemplateInput,
): ContractSection[] {
  const monthly =
    input.monthlyPriceCents === null
      ? "gemäß individuellem Angebot"
      : `${euro.format(input.monthlyPriceCents / 100)} brutto je Monat`;
  const setup =
    input.setupPriceCents === null
      ? "gemäß individuellem Angebot"
      : `${euro.format(input.setupPriceCents / 100)} brutto einmalig`;
  const billingAmount =
    input.billingAmountCents === null
      ? "gemäß individuellem Angebot"
      : `${euro.format(input.billingAmountCents / 100)} je Abrechnungszeitraum`;
  const intervalDescription =
    input.billingIntervalMonths === 12
      ? `jährlich im Voraus${input.discountBasisPoints > 0 ? ` mit ${(input.discountBasisPoints / 100).toLocaleString("de-DE")} % Preisvorteil` : ""}`
      : "monatlich";

  return [
    {
      heading: "1. Vertragsgegenstand",
      paragraphs: [
        `FahrSeiten stellt dem Kunden das Paket „${input.packageName}“ als zentral betriebene Website- und Verwaltungsplattform bereit. Der konkrete Funktionsumfang ergibt sich aus dem bei Vertragsschluss gültigen Angebot und der Paketbeschreibung. Individuelle Zusatzleistungen sind nur geschuldet, wenn sie ausdrücklich in Textform vereinbart wurden.`,
        "Die Plattform wird fortlaufend weiterentwickelt. Änderungen, die Sicherheit, Wartbarkeit oder Bedienbarkeit verbessern und den vereinbarten Kernnutzen nicht wesentlich einschränken, sind zulässig.",
      ],
    },
    {
      heading: "2. Einrichtung und Mitwirkung",
      paragraphs: [
        "Der Kunde stellt die für Einrichtung und Betrieb benötigten Angaben, Zugänge und Freigaben vollständig und rechtzeitig bereit. Verzögerungen aus fehlender Mitwirkung verschieben vereinbarte Termine angemessen.",
        "Der Kunde prüft Stammdaten, Domainzuordnung, Kontaktdaten und veröffentlichte Seiten vor der Freigabe. Technische Korrekturen durch FahrSeiten ersetzen keine fachliche oder rechtliche Prüfung durch den Kunden.",
      ],
    },
    {
      heading: "3. Inhalte, Rechte und rechtliche Verantwortung",
      paragraphs: [
        "Der Kunde ist für die von ihm bereitgestellten, ausgewählten oder freigegebenen Texte, Bilder, Logos, Marken, Preise, Angebote und sonstigen Inhalte verantwortlich. Er sichert zu, dass diese richtig, aktuell und rechtmäßig sind und dass er die erforderlichen Nutzungs- und Persönlichkeitsrechte besitzt.",
        "Automatisch erzeugte oder technisch unterstützte Impressums-, Datenschutz- und Cookie-Texte sind Arbeitshilfen. Der Kunde muss sie vor Veröffentlichung auf seinen konkreten Betrieb, seine eingesetzten Dienste und seine Rechtsform prüfen und bei Bedarf rechtlich beraten lassen.",
        "FahrSeiten bleibt für eigene technische Leistungen, die sichere Plattformbereitstellung und selbst erstellte Inhalte verantwortlich. Eine Freistellung von zwingender eigener Haftung ist mit dieser Inhaltsverantwortung nicht verbunden.",
      ],
    },
    {
      heading: "4. Domain, Medien und Drittanbieter",
      paragraphs: [
        "Domains können beim bisherigen Anbieter verbleiben und technisch mit FahrSeiten verbunden werden. Der Kunde bleibt für Domaininhaberschaft, Verlängerung und korrekte DNS-Freigaben verantwortlich, soweit nichts anderes vereinbart wurde.",
        "Dienste Dritter, insbesondere Hosting-, Karten-, Analyse-, E-Mail- oder Zahlungsdienste, können eigene Bedingungen und Entgelte haben. Sie werden nur entsprechend der gebuchten Module und erteilten Freigaben eingebunden.",
      ],
    },
    {
      heading: "5. Vergütung und Abrechnung",
      paragraphs: [
        `Die vereinbarte Basisvergütung beträgt ${monthly}; die Einrichtung kostet ${setup}. Abgerechnet wird ${intervalDescription}. Der fest vereinbarte Betrag beträgt ${billingAmount}. Mindestlaufzeit und Zahlungsintervall sind voneinander unabhängige Vertragsangaben. Alle Rechnungen werden separat über das von FahrSeiten eingesetzte Rechnungssystem übermittelt. Die Anzeige im Kundenbereich dient der Übersicht und ersetzt nicht die Rechnung.`,
        "Empfehlungsgutschriften werden nur nach den gesonderten Empfehlungsbedingungen und erst nach ausdrücklicher Bestätigung auf einer konkreten Rechnung berücksichtigt. Sie verändern den vereinbarten Paketpreis nicht dauerhaft und werden nicht in bar ausgezahlt.",
        "Eine Jahreszahlung ist eine vorausbezahlte Zahlungsweise und verlängert die Vertragsbindung nicht eigenständig. Endet der Vertrag wirksam vor dem Ende eines bereits bezahlten Jahreszeitraums, wird das Entgelt für die danach liegenden vollen Leistungsmonate über das führende Rechnungssystem gutgeschrieben, soweit keine offenen Gegenansprüche bestehen.",
        input.nextInvoiceAt
          ? `Der nächste planmäßige Rechnungstermin ist der ${date.format(input.nextInvoiceAt)}. Das konkrete Zahlungsziel ergibt sich aus der jeweiligen Rechnung.`
          : "Der nächste Rechnungstermin und das konkrete Zahlungsziel ergeben sich aus der jeweiligen Rechnung.",
      ],
    },
    {
      heading: "6. Beginn, Laufzeit und Kündigung",
      paragraphs: [
        `Der Vertrag beginnt am ${date.format(input.startsAt)}. Die Mindestlaufzeit beträgt ${input.minimumTermMonths} Monat(e). Er kann mit einer Frist von ${input.cancellationNoticeMonths} Monat zum Ende der Mindestlaufzeit in Textform gekündigt werden. Ohne Kündigung läuft er anschließend ${input.renewsIndefinitely ? "auf unbestimmte Zeit weiter und kann mit derselben Frist zum Monatsende gekündigt werden" : "nach Maßgabe des angenommenen Angebots weiter"}. Zahlungsintervall und Laufzeit sind voneinander unabhängig. Außerordentliche Kündigungsrechte bleiben unberührt.`,
      ],
    },
    {
      heading: "7. Betrieb, Wartung und Datensicherung",
      paragraphs: [
        "FahrSeiten darf notwendige Wartungs- und Sicherheitsarbeiten durchführen. Planbare Einschränkungen werden nach Möglichkeit angekündigt. Bei Störungen werden Wiederherstellung und Schadensbegrenzung nach Dringlichkeit bearbeitet.",
        "Der Kunde erhält im Rahmen der verfügbaren Exportfunktionen Zugriff auf seine Inhalte. Gesetzliche Aufbewahrungspflichten für Geschäftsunterlagen und Rechnungen bleiben bei der jeweils verantwortlichen Partei.",
      ],
    },
    {
      heading: "8. Datenschutz und Vertraulichkeit",
      paragraphs: [
        "Beide Parteien beachten die anwendbaren Datenschutzvorschriften. Soweit FahrSeiten personenbezogene Daten im Auftrag verarbeitet, schließen die Parteien vor Verarbeitungsbeginn eine gesonderte Vereinbarung zur Auftragsverarbeitung. Zugangsdaten und vertrauliche Informationen sind angemessen zu schützen.",
      ],
    },
    {
      heading: "9. Mängel und Haftung",
      paragraphs: [
        "Mängel sind mit nachvollziehbarer Beschreibung unverzüglich zu melden. FahrSeiten erhält Gelegenheit zur Nacherfüllung. Bei Vorsatz, grober Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit sowie nach zwingendem Produkthaftungsrecht wird unbeschränkt gehaftet.",
        "Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit gesetzlich zulässig. Für Datenverlust ist die Haftung auf den Aufwand beschränkt, der bei angemessener Datensicherung entstanden wäre.",
      ],
    },
    {
      heading: "10. Vertragsende und Schlussbestimmungen",
      paragraphs: [
        "Nach Vertragsende werden Zugänge gesperrt und Daten nach den vertraglich vereinbarten beziehungsweise gesetzlichen Fristen exportiert oder gelöscht. Unterstützungsleistungen für Domainumzug oder Sonderexporte können gesondert vergütet werden.",
        "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, wird der Sitz des Anbieters als Gerichtsstand vereinbart. Individuelle Vereinbarungen gehen diesen Vertragsbedingungen vor.",
      ],
    },
  ];
}
