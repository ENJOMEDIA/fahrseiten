import { z } from "zod";

export const legalDocumentInputSchema = z.object({
  type: z.enum(["imprint", "privacy"]),
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

export function publicationWarnings(
  type: "imprint" | "privacy",
  content: string,
) {
  const required =
    type === "imprint" ? requiredImprintMarkers : requiredPrivacyMarkers;
  return required
    .filter(
      (marker) =>
        !content
          .toLocaleLowerCase("de")
          .includes(marker.toLocaleLowerCase("de")),
    )
    .map((marker) => `Pflichtbereich „${marker}“ fehlt.`);
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

const pending = (value?: string) =>
  value?.trim() || "[nicht angegeben – rechtlich prüfen]";

export function createLegalDrafts(input: LegalTemplateInput) {
  const address = `${input.street}\n${input.postalCode} ${input.city}`;
  return {
    imprint: `Impressum – ENTWURF\n\nAnbieter\n${input.companyName}\nRechtsform: ${pending(input.legalForm)}\n\nAnschrift\n${address}\n\nVertretung\n${input.ownerName}\n\nKontakt\nE-Mail: ${input.email}\nTelefon: ${pending(input.phone)}\n\nRegister\nRegistergericht: ${pending(input.registerCourt)}\nRegisternummer: ${pending(input.registerNumber)}\n\nUmsatzsteuer-ID\n${pending(input.vatId)}\n\nAufsichtsbehörde\n${pending(input.supervisoryAuthority)}\n\nVerantwortlich für journalistisch-redaktionelle Inhalte\n${pending(input.editorialResponsible)}\n${address}\n\nDieser Entwurf muss vor der Veröffentlichung rechtlich geprüft und vervollständigt werden.`,
    privacy: `Datenschutzerklärung – ENTWURF\n\n1. Verantwortlich\n${input.companyName}\n${address}\nE-Mail: ${input.privacyContactEmail || input.email}\nTelefon: ${pending(input.phone)}\n\n2. Hosting und technische Bereitstellung\nHosting-Anbieter: ${input.hostingProvider}\nBeim Abruf der Website werden technisch erforderliche Verbindungs- und Protokolldaten verarbeitet. Rechtsgrundlage, Empfänger, konkrete Speicherdauer und mögliche Drittlandübermittlungen sind vor Veröffentlichung anhand der tatsächlichen Hostingkonfiguration zu prüfen.\n\n3. Kontaktanfragen\nBei einer Kontaktaufnahme werden die eingegebenen Angaben zur Bearbeitung der Anfrage verarbeitet. Rechtsgrundlage und Speicherdauer richten sich nach Anlass und tatsächlichem Prozess und müssen rechtlich festgelegt werden.\n\n4. Cookies und optionale Dienste\nTechnisch notwendige Speicherungen dienen dem ausdrücklich gewünschten Betrieb. Funktionale, Statistik- und Marketingdienste dürfen erst nach einer passenden Einwilligung geladen werden. Eine erteilte Einwilligung kann jederzeit über die Cookie-Einstellungen widerrufen werden.\n\n5. Betroffenenrechte\nBetroffene Personen können insbesondere Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch verlangen sowie eine Einwilligung widerrufen und sich bei einer Datenschutzaufsichtsbehörde beschweren.\n\n6. Speicherdauer\n[nach Datenkategorie und tatsächlichem Prozess rechtlich festlegen]\n\nDieser Entwurf muss vor der Veröffentlichung anhand aller tatsächlich eingesetzten Dienste, Empfänger und Prozesse rechtlich geprüft und vervollständigt werden.`,
  };
}
