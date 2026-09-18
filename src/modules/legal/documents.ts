import { z } from "zod";

import type { LegalModuleSettings, LegalProfileData } from "@/db/schema";

export const legalDocumentInputSchema = z.object({
  type: z.enum(["imprint", "privacy", "terms"]),
  content: z.string().trim().min(80).max(100_000),
  version: z.number().int().positive(),
  warningAcknowledged: z.literal(true),
});

const requiredImprintMarkers = ["Anschrift", "Kontakt", "Vertretung"];
const requiredPrivacyMarkers = [
  "Verantwortlich",
  "Rechtsgrundlage",
  "Speicherdauer",
  "Betroffenenrechte",
];
const requiredTermsMarkers = [
  "Geltungsbereich",
  "Leistungsumfang",
  "Vertragsschluss",
  "Vergütung",
  "Laufzeit",
  "Haftung",
  "Datenschutz",
];

export function publicationWarnings(
  type: "imprint" | "privacy" | "terms",
  content: string,
) {
  const required =
    type === "imprint"
      ? requiredImprintMarkers
      : type === "privacy"
        ? requiredPrivacyMarkers
        : requiredTermsMarkers;
  return required
    .filter(
      (marker) =>
        !content
          .toLocaleLowerCase("de")
          .includes(marker.toLocaleLowerCase("de")),
    )
    .map((marker) => `Pflichtbereich „${marker}“ fehlt.`);
}

export function createPlatformTermsDraft(data: LegalProfileData) {
  return `Allgemeine Geschäftsbedingungen – ENTWURF

1. Geltungsbereich
Diese Allgemeinen Geschäftsbedingungen gelten für Verträge zwischen ${data.companyName} (nachfolgend „Anbieter“) und Unternehmern im Sinne des § 14 BGB, insbesondere Fahrschulen (nachfolgend „Kunde“), über die Bereitstellung und Betreuung der FahrSeiten-Plattform. Verträge mit Verbrauchern werden auf dieser Grundlage nicht geschlossen. Abweichende Bedingungen des Kunden gelten nur, wenn der Anbieter ihnen ausdrücklich in Textform zustimmt.

2. Leistungsumfang
Der konkrete Leistungsumfang ergibt sich aus dem ausgewählten Paket, dem individuellen Angebot, der Leistungsbeschreibung und der Auftragsbestätigung. Zusatzleistungen wie Fotografie, Medienproduktion, Texterstellung, Domainumzüge oder individuelle Anpassungen werden nur geschuldet, wenn sie ausdrücklich vereinbart wurden. Der Anbieter darf die Plattform weiterentwickeln, sofern der vereinbarte Kernnutzen dadurch nicht wesentlich eingeschränkt wird.

3. Vertragsschluss
[Festlegen: Wie werden Angebot, Annahme, Onboarding und Beginn des kostenpflichtigen Vertrags verbindlich?]

4. Einrichtung und Mitwirkungspflichten
Der Kunde stellt richtige und vollständige Stammdaten, Inhalte, Kontaktdaten, Freigaben und erforderliche Zugänge rechtzeitig bereit. Verzögerungen aus fehlender Mitwirkung verschieben vereinbarte Termine angemessen. Der Kunde prüft die eingerichtete Website vor Veröffentlichung und meldet erkennbare Fehler unverzüglich.

5. Verantwortung für Inhalte und Rechte
Der Kunde ist für alle von ihm bereitgestellten, ausgewählten oder freigegebenen Texte, Bilder, Logos, Marken, Preise, Angebote und sonstigen Inhalte verantwortlich. Er sichert zu, dass die Inhalte richtig und rechtmäßig sind und er über alle erforderlichen Nutzungs-, Marken- und Persönlichkeitsrechte verfügt. Bei nachvollziehbaren Rechtsverletzungen darf der Anbieter betroffene Inhalte vorübergehend sperren und den Kunden informieren.

Automatisch erzeugte oder technisch unterstützte Impressums-, Datenschutz-, Cookie- und Vertragstexte sind Arbeitshilfen. Der Kunde muss sie auf seinen konkreten Betrieb, seine Rechtsform und die tatsächlich eingesetzten Dienste prüfen und bei Bedarf rechtlich beraten lassen. Der Anbieter bleibt für seine eigenen technischen Leistungen und selbst erstellten Inhalte verantwortlich.

6. Domains und Drittanbieter
[Festlegen: Wer wird Domaininhaber, wer trägt laufende Domain-, Hosting- und Drittanbieterkosten und wie erfolgt ein Anbieterwechsel?]

7. Vergütung, Rechnung und Verzug
[Festlegen: Einrichtungspreis, monatliche Abrechnung, Zahlungsziel, Umsatzsteuer, Verzug und Preise für Zusatzleistungen.]
Rechnungen werden über das eingesetzte externe Rechnungssystem separat übermittelt. Eine zusätzliche Anzeige oder PDF-Kopie im FahrSeiten-Kundenbereich dient nur der Übersicht und ersetzt nicht die Rechnung. Der Kunde hält seine Rechnungsanschrift und Rechnungskontaktadresse aktuell.

8. Laufzeit und Kündigung
[Festlegen: Mindestlaufzeit, Verlängerung, ordentliche Kündigungsfrist und Folgen einer Vertragsbeendigung.]

9. Verfügbarkeit, Wartung und Störungen
[Festlegen: zugesagte Verfügbarkeit, angekündigte Wartungsfenster, Sicherheitsupdates und zulässige Weiterentwicklung der Plattform.]
Der Kunde meldet Störungen mit einer nachvollziehbaren Beschreibung. Der Anbieter darf notwendige Wartungs- und Sicherheitsarbeiten durchführen und kündigt planbare Einschränkungen nach Möglichkeit an.

10. Nutzungsrechte und Medienleistungen
Der Kunde räumt dem Anbieter die für Vertragserfüllung, Speicherung, technische Bearbeitung und öffentliche Auslieferung erforderlichen, auf die Vertragsdauer beschränkten Nutzungsrechte an bereitgestellten Inhalten ein. Rechte an individuell erstellten Foto- und Medienleistungen, Rohdateien und Bearbeitungen richten sich nach dem jeweiligen Angebot.

11. Datenschutz und Auftragsverarbeitung
Die Parteien beachten die anwendbaren Datenschutzvorschriften. Soweit ${data.companyName} personenbezogene Daten im Auftrag des Kunden verarbeitet, wird vor Beginn der Verarbeitung eine gesonderte Vereinbarung zur Auftragsverarbeitung geschlossen.

12. Mängel und Haftung
Der Anbieter erhält bei Mängeln zunächst Gelegenheit zur Nacherfüllung. Der Anbieter haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz und in sonstigen gesetzlich zwingenden Fällen. Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist die Haftung auf den vertragstypischen, bei Vertragsschluss vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit gesetzlich zulässig. Für Datenverlust ist die Haftung auf den Wiederherstellungsaufwand begrenzt, der bei angemessener Datensicherung entstanden wäre.

[Durch Rechtsberatung festlegen: angemessene Haftungshöchstgrenze für typische Sach- und Vermögensschäden sowie konkrete Regelung zu höherer Gewalt.]

13. Sperrung
Bei erheblichem Zahlungsverzug, Sicherheitsgefahren oder rechtswidriger Nutzung darf der Anbieter den betroffenen Zugang nach vorheriger Ankündigung vorübergehend sperren, soweit keine sofortige Maßnahme erforderlich ist. Die Sperrung muss verhältnismäßig sein und wird aufgehoben, sobald ihr Grund entfällt.

14. Datenexport und Vertragsende
[Festlegen: Exportformat, Bereitstellungsfrist, Löschfrist, Domainübertragung und kostenpflichtige Unterstützungsleistungen nach Vertragsende.]

15. Vertraulichkeit
Beide Parteien behandeln nicht öffentliche geschäftliche und technische Informationen vertraulich. Gesetzliche Offenlegungs- und Aufbewahrungspflichten bleiben unberührt.

16. Änderungen dieser AGB
[Festlegen: Unter welchen Voraussetzungen und mit welcher Vorlauffrist dürfen AGB für laufende Verträge geändert werden? Eine Zustimmungsfiktion darf nicht pauschal unterstellt werden.]

17. Schlussbestimmungen
[Festlegen: anwendbares Recht, Gerichtsstand für Unternehmer, Textform und Umgang mit unwirksamen Bestimmungen.]

Dieser B2B-Entwurf enthält offene geschäftliche und rechtliche Entscheidungen. Er darf erst nach Vervollständigung, Abgleich mit Angebot, Vertragsmuster und AVV sowie anwaltlicher Prüfung veröffentlicht oder in Verträge einbezogen werden.`;
}

export function validateLegalPublication(raw: unknown) {
  const input = legalDocumentInputSchema.parse(raw);
  const warnings = publicationWarnings(input.type, input.content);
  if (warnings.length > 0) throw new Error(warnings.join(" "));
  return input;
}

type LegalTemplateInput = {
  companyName: string;
  ownerName: string;
  email: string;
  phone?: string;
  street: string;
  postalCode: string;
  city: string;
  legalForm?: string;
  registerCourt?: string;
  registerNumber?: string;
  vatId?: string;
  supervisoryAuthority?: string;
  editorialResponsible?: string;
  privacyContactEmail?: string;
  hostingProvider: string;
};

export const legalProfileSchema = z
  .object({
    companyName: z.string().trim().min(2).max(160),
    legalForm: z.enum(["individual", "gbr", "ug", "gmbh", "other"]),
    representativeName: z.string().trim().min(2).max(160),
    street: z.string().trim().min(3).max(180),
    postalCode: z.string().trim().min(3).max(20),
    city: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(80),
    email: z.email().transform((value) => value.trim().toLowerCase()),
    phone: z.string().trim().max(40),
    registerType: z.enum([
      "none",
      "commercial",
      "partnership",
      "cooperative",
      "association",
    ]),
    registerCourt: z.string().trim().max(200),
    registerNumber: z.string().trim().max(100),
    vatId: z.string().trim().max(40),
    regulatedActivity: z.boolean(),
    supervisoryAuthority: z.string().trim().max(300),
    journalisticContent: z.boolean(),
    editorialResponsible: z.string().trim().max(200),
    privacyContactEmail: z.email(),
    dataProtectionOfficerRequired: z.boolean(),
    dataProtectionOfficerEmail: z.union([z.literal(""), z.email()]),
    hostingProvider: z.string().trim().min(2).max(200),
    inquiryRetentionMonths: z.union([
      z.literal(3),
      z.literal(6),
      z.literal(12),
      z.literal(24),
    ]),
  })
  .superRefine((value, context) => {
    if (
      value.registerType !== "none" &&
      (!value.registerCourt || !value.registerNumber)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Für eine Registereintragung werden Registergericht und Registernummer benötigt.",
      });
    }
    if (value.regulatedActivity && !value.supervisoryAuthority) {
      context.addIssue({
        code: "custom",
        message:
          "Für die erlaubnispflichtige Tätigkeit wird die zuständige Aufsichtsbehörde benötigt.",
      });
    }
    if (value.journalisticContent && !value.editorialResponsible) {
      context.addIssue({
        code: "custom",
        message:
          "Für redaktionelle Inhalte wird eine verantwortliche Person benötigt.",
      });
    }
    if (
      value.dataProtectionOfficerRequired &&
      !value.dataProtectionOfficerEmail
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Für den Datenschutzbeauftragten wird eine Kontaktadresse benötigt.",
      });
    }
  });

export const legalModulesSchema = z.object({
  contactForm: z.boolean(),
  emailDelivery: z.boolean(),
  consentManagement: z.boolean(),
  maps: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  video: z.boolean(),
  messaging: z.boolean(),
  onlineBooking: z.boolean(),
  payments: z.boolean(),
});

const legalFormLabels: Record<LegalProfileData["legalForm"], string> = {
  individual: "Einzelunternehmen",
  gbr: "Gesellschaft bürgerlichen Rechts (GbR)",
  ug: "Unternehmergesellschaft (haftungsbeschränkt)",
  gmbh: "Gesellschaft mit beschränkter Haftung (GmbH)",
  other: "Sonstige Rechtsform",
};

const registerLabels: Record<
  Exclude<LegalProfileData["registerType"], "none">,
  string
> = {
  commercial: "Handelsregister",
  partnership: "Partnerschaftsregister",
  cooperative: "Genossenschaftsregister",
  association: "Vereinsregister",
};

export const defaultLegalModules: LegalModuleSettings = {
  contactForm: true,
  emailDelivery: true,
  consentManagement: true,
  maps: false,
  analytics: false,
  marketing: false,
  video: false,
  messaging: false,
  onlineBooking: false,
  payments: false,
};

export function parseLegalProfileForm(formData: FormData) {
  const checked = (name: keyof LegalModuleSettings) =>
    formData.get(`module_${name}`) === "on";
  return {
    data: legalProfileSchema.parse({
      companyName: formData.get("companyName"),
      legalForm: formData.get("legalForm"),
      representativeName: formData.get("representativeName"),
      street: formData.get("street"),
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      country: formData.get("country"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      registerType: formData.get("registerType"),
      registerCourt: formData.get("registerCourt"),
      registerNumber: formData.get("registerNumber"),
      vatId: formData.get("vatId"),
      regulatedActivity: formData.get("regulatedActivity") === "on",
      supervisoryAuthority: formData.get("supervisoryAuthority"),
      journalisticContent: formData.get("journalisticContent") === "on",
      editorialResponsible: formData.get("editorialResponsible"),
      privacyContactEmail: formData.get("privacyContactEmail"),
      dataProtectionOfficerRequired:
        formData.get("dataProtectionOfficerRequired") === "on",
      dataProtectionOfficerEmail: formData.get("dataProtectionOfficerEmail"),
      hostingProvider: formData.get("hostingProvider"),
      inquiryRetentionMonths: Number(formData.get("inquiryRetentionMonths")),
    }),
    modules: legalModulesSchema.parse({
      contactForm: checked("contactForm"),
      emailDelivery: checked("emailDelivery"),
      consentManagement: checked("consentManagement"),
      maps: checked("maps"),
      analytics: checked("analytics"),
      marketing: checked("marketing"),
      video: checked("video"),
      messaging: checked("messaging"),
      onlineBooking: checked("onlineBooking"),
      payments: checked("payments"),
    }),
  };
}

export function createStructuredLegalDocuments(input: {
  data: LegalProfileData;
  modules: LegalModuleSettings;
  platformPostalAcquisition?: boolean;
}) {
  const { data, modules, platformPostalAcquisition = false } = input;
  const address = `${data.street}\n${data.postalCode} ${data.city}\n${data.country}`;
  const imprintSections = [
    `Impressum\n\nAngaben gemäß § 5 DDG und § 18 Abs. 1 MStV\n\nAnbieter\n${data.companyName}\nRechtsform: ${legalFormLabels[data.legalForm]}\n\nAnschrift\n${address}`,
    `Vertretung\n${data.representativeName}`,
    `Kontakt\nE-Mail: ${data.email}${data.phone ? `\nTelefon: ${data.phone}` : ""}`,
  ];
  if (data.registerType !== "none") {
    imprintSections.push(
      `${registerLabels[data.registerType]}\nRegistergericht: ${data.registerCourt}\nRegisternummer: ${data.registerNumber}`,
    );
  }
  if (data.vatId)
    imprintSections.push(`Umsatzsteuer-Identifikationsnummer\n${data.vatId}`);
  if (data.regulatedActivity)
    imprintSections.push(
      `Zuständige Aufsichtsbehörde\n${data.supervisoryAuthority}`,
    );
  if (data.journalisticContent)
    imprintSections.push(
      `Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV\n${data.editorialResponsible}\n${address}`,
    );

  const privacySections = [
    `Datenschutzerklärung\n\n1. Verantwortlicher\n${data.companyName}\n\nAnschrift\n${address}\nE-Mail: ${data.privacyContactEmail}${data.phone ? `\nTelefon: ${data.phone}` : ""}`,
  ];
  if (data.dataProtectionOfficerRequired) {
    privacySections.push(
      `2. Datenschutzbeauftragter\nE-Mail: ${data.dataProtectionOfficerEmail}`,
    );
  }
  privacySections.push(
    `${privacySections.length + 1}. Hosting und Server-Protokolle\nDiese Website wird bei ${data.hostingProvider} betrieben. Beim Aufruf verarbeitet der Hosting-Anbieter technisch erforderliche Verbindungsdaten, insbesondere IP-Adresse, Zeitpunkt, angeforderte Ressource, Referrer sowie Browser- und Systeminformationen. Die Verarbeitung erfolgt zur sicheren und stabilen Bereitstellung gemäß Art. 6 Abs. 1 lit. f DSGVO. Protokolldaten werden gelöscht, sobald sie für diesen Zweck nicht mehr erforderlich sind, soweit keine gesetzlichen Pflichten entgegenstehen.`,
  );
  if (modules.contactForm) {
    privacySections.push(
      `${privacySections.length + 1}. Kontaktanfragen\nBei einer Kontaktaufnahme verarbeiten wir die eingegebenen Kontakt- und Nachrichtendaten zur Bearbeitung der Anfrage. Je nach Inhalt erfolgt dies zur Durchführung vorvertraglicher Maßnahmen gemäß Art. 6 Abs. 1 lit. b DSGVO oder auf Grundlage unseres berechtigten Interesses an der Beantwortung gemäß Art. 6 Abs. 1 lit. f DSGVO. Anfragen werden regelmäßig nach ${data.inquiryRetentionMonths} Monaten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten oder eine weitere Vertragsbeziehung bestehen.`,
    );
  }
  if (modules.emailDelivery) {
    privacySections.push(
      `${privacySections.length + 1}. E-Mail-Kommunikation\nFür den Versand und Empfang von E-Mails werden Adress-, Nachrichten- und technische Zustelldaten über den konfigurierten E-Mail-Dienst verarbeitet. Die Rechtsgrundlage richtet sich nach dem Anlass der Kommunikation und ist regelmäßig Art. 6 Abs. 1 lit. b oder lit. f DSGVO.`,
    );
  }
  if (modules.consentManagement) {
    privacySections.push(
      `${privacySections.length + 1}. Einwilligungsverwaltung\nDie Website speichert die Auswahl zu optionalen Diensten, damit diese Entscheidung beachtet und nachgewiesen werden kann. Technisch erforderliche Speicherungen erfolgen nach § 25 Abs. 2 Nr. 2 TDDDG; optionale Dienste werden erst nach einer Einwilligung gemäß § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO geladen. Eine Einwilligung kann jederzeit über die Cookie-Einstellungen widerrufen werden.`,
    );
  }
  if (platformPostalAcquisition) {
    privacySections.push(
      `${privacySections.length + 1}. Postalische Akquise und Rückmeldungen\nFür gezielt ausgewählte Geschäftskontakte verarbeiten wir Firmenanschrift, öffentlich zugängliche geschäftliche Kontaktdaten, Datenquelle, Versandstatus und Rückmeldung zur Direktwerbung. Rechtsgrundlage für die postalische Ansprache und die interne Dokumentation ist Art. 6 Abs. 1 lit. f DSGVO. Über den persönlichen Rückmeldelink kann Interesse erklärt oder jeder weitere Werbekontakt abgelehnt werden. Eine freiwillige Einwilligung in E-Mail-Informationen wird getrennt erfasst und per Double-Opt-in bestätigt; Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Ein Widerruf oder Werbewiderspruch wird dauerhaft in einer Sperrliste berücksichtigt.`,
    );
  }
  const optionalModules: Array<[keyof LegalModuleSettings, string, string]> = [
    ["maps", "Kartendienste", "interaktive Karten und Standortdarstellungen"],
    ["analytics", "Reichweitenmessung", "statistische Nutzungsanalysen"],
    ["video", "Externe Videos", "eingebettete Videoinhalte"],
    [
      "messaging",
      "SMS und Messenger",
      "Nachrichten, Statusinformationen und Zustellnachweise",
    ],
    [
      "onlineBooking",
      "Online-Terminbuchung",
      "Terminwünsche und Buchungsdaten",
    ],
    ["payments", "Online-Zahlungen", "Zahlungs- und Transaktionsdaten"],
  ];
  for (const [key, title, purpose] of optionalModules) {
    if (!modules[key]) continue;
    privacySections.push(
      `${privacySections.length + 1}. ${title}\nWenn dieser Dienst genutzt wird, werden die für ${purpose} erforderlichen Daten verarbeitet. Der Dienst wird nur nach einer passenden Einwilligung oder einer anderen im konkreten Vorgang ausgewiesenen Rechtsgrundlage aktiviert. Anbieter, Empfänger, Speicherdauer und mögliche Drittlandübermittlungen müssen vor Aktivierung in der technischen Dienstekonfiguration vollständig hinterlegt und geprüft werden.`,
    );
  }
  privacySections.push(
    `${privacySections.length + 1}. Speicherdauer\nPersonenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Die für unverbindliche Kontaktanfragen festgelegte Regelfrist beträgt ${data.inquiryRetentionMonths} Monate.`,
  );
  privacySections.push(
    `${privacySections.length + 1}. Betroffenenrechte\nBetroffene Personen haben im Rahmen der gesetzlichen Voraussetzungen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Erteilte Einwilligungen können jederzeit mit Wirkung für die Zukunft widerrufen werden. Zudem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.`,
  );

  return {
    imprint: imprintSections.join("\n\n"),
    privacy: privacySections.join("\n\n"),
  };
}

const pending = (value?: string) =>
  value?.trim() || "[nicht angegeben – rechtlich prüfen]";

export function createInitialLegalProfile(
  input: LegalTemplateInput,
  options: { regulatedActivity: boolean },
): { data: LegalProfileData; modules: LegalModuleSettings } {
  const form = input.legalForm?.toLocaleLowerCase("de") ?? "";
  const legalForm: LegalProfileData["legalForm"] = form.includes("gmbh")
    ? "gmbh"
    : form.includes("ug")
      ? "ug"
      : form.includes("gbr")
        ? "gbr"
        : form.includes("einzel")
          ? "individual"
          : "other";
  return {
    data: {
      companyName: input.companyName,
      legalForm,
      representativeName: input.ownerName,
      street: input.street,
      postalCode: input.postalCode,
      city: input.city,
      country: "Deutschland",
      email: input.email,
      phone: input.phone ?? "",
      registerType:
        input.registerCourt || input.registerNumber ? "commercial" : "none",
      registerCourt: input.registerCourt ?? "",
      registerNumber: input.registerNumber ?? "",
      vatId: input.vatId ?? "",
      regulatedActivity: options.regulatedActivity,
      supervisoryAuthority: input.supervisoryAuthority ?? "",
      journalisticContent: Boolean(input.editorialResponsible),
      editorialResponsible: input.editorialResponsible ?? "",
      privacyContactEmail: input.privacyContactEmail || input.email,
      dataProtectionOfficerRequired: false,
      dataProtectionOfficerEmail: "",
      hostingProvider: input.hostingProvider,
      inquiryRetentionMonths: 6,
    },
    modules: defaultLegalModules,
  };
}

export function createLegalDrafts(input: LegalTemplateInput) {
  const address = `${input.street}\n${input.postalCode} ${input.city}`;
  return {
    imprint: `Impressum – ENTWURF\n\nAnbieter\n${input.companyName}\nRechtsform: ${pending(input.legalForm)}\n\nAnschrift\n${address}\n\nVertretung\n${input.ownerName}\n\nKontakt\nE-Mail: ${input.email}\nTelefon: ${pending(input.phone)}\n\nRegister\nRegistergericht: ${pending(input.registerCourt)}\nRegisternummer: ${pending(input.registerNumber)}\n\nUmsatzsteuer-ID\n${pending(input.vatId)}\n\nAufsichtsbehörde\n${pending(input.supervisoryAuthority)}\n\nVerantwortlich für journalistisch-redaktionelle Inhalte\n${pending(input.editorialResponsible)}\n${address}\n\nDieser Entwurf muss vor der Veröffentlichung rechtlich geprüft und vervollständigt werden.`,
    privacy: `Datenschutzerklärung – ENTWURF\n\n1. Verantwortlich\n${input.companyName}\n${address}\nE-Mail: ${input.privacyContactEmail || input.email}\nTelefon: ${pending(input.phone)}\n\n2. Hosting und technische Bereitstellung\nHosting-Anbieter: ${input.hostingProvider}\nBeim Abruf der Website werden technisch erforderliche Verbindungs- und Protokolldaten verarbeitet. Rechtsgrundlage, Empfänger, konkrete Speicherdauer und mögliche Drittlandübermittlungen sind vor Veröffentlichung anhand der tatsächlichen Hostingkonfiguration zu prüfen.\n\n3. Kontaktanfragen\nBei einer Kontaktaufnahme werden die eingegebenen Angaben zur Bearbeitung der Anfrage verarbeitet. Rechtsgrundlage und Speicherdauer richten sich nach Anlass und tatsächlichem Prozess und müssen rechtlich festgelegt werden.\n\n4. Cookies und optionale Dienste\nTechnisch notwendige Speicherungen dienen dem ausdrücklich gewünschten Betrieb. Funktionale, Statistik- und Marketingdienste dürfen erst nach einer passenden Einwilligung geladen werden. Eine erteilte Einwilligung kann jederzeit über die Cookie-Einstellungen widerrufen werden.\n\n5. Betroffenenrechte\nBetroffene Personen können insbesondere Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch verlangen sowie eine Einwilligung widerrufen und sich bei einer Datenschutzaufsichtsbehörde beschweren.\n\n6. Speicherdauer\n[nach Datenkategorie und tatsächlichem Prozess rechtlich festlegen]\n\nDieser Entwurf muss vor der Veröffentlichung anhand aller tatsächlich eingesetzten Dienste, Empfänger und Prozesse rechtlich geprüft und vervollständigt werden.`,
  };
}
