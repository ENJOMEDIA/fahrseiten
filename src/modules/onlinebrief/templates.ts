import "server-only";

import { asc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { postalLetterTemplates } from "@/db/schema";
import { createId } from "@/lib/ids";
import { parseSalesLeadTags } from "@/modules/platform/sales-tags";

const letterTemplateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  kickerTemplate: z.string().trim().min(3).max(120),
  headlineTemplate: z.string().trim().min(10).max(180),
  bodyTemplate: z.string().trim().min(80).max(1_200),
  active: z.boolean().default(true),
});

export const builtinPostalTemplates = [
  {
    id: "builtin-einfach-aktuell",
    name: "Weniger Website-Stress",
    kickerTemplate: "WENIGER PFLEGE. MEHR ZEIT FÜRS FAHREN.",
    headlineTemplate: "Ihre Website sollte mitfahren – nicht aufhalten.",
    bodyTemplate:
      "Preise ändern, einen Kurs veröffentlichen oder ein neues Fahrzeug zeigen – ohne Agentur-Wartezeit und ohne Technikstress.\n\n## Was sofort leichter wird\n• Inhalte in wenigen Schritten selbst aktualisieren\n• Klassen, Preise, Kurse und Fahrzeuge an einem Ort\n• Ein hochwertiger Auftritt, der auch nach Änderungen stimmig bleibt\n\nScannen Sie Ihren persönlichen QR-Code und sehen Sie in weniger als einer Minute, wie FahrSeiten den Website-Alltag von {{Fahrschule}} einfacher machen kann.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
  {
    id: "builtin-erster-eindruck",
    name: "Der erste Eindruck fährt mit",
    kickerTemplate: "DER ERSTE EINDRUCK ENTSTEHT VOR DEM ERSTEN ANRUF.",
    headlineTemplate: "Der erste Eindruck von {{Fahrschule}} beginnt online.",
    bodyTemplate:
      "Fahrschüler entscheiden online, wem sie ihre Ausbildung anvertrauen. FahrSeiten übersetzt die Qualität Ihrer Fahrschule in einen modernen, klaren Auftritt.\n\n## Der Unterschied auf einen Blick\n• Vertrauen schaffen, bevor das erste Gespräch beginnt\n• Team, Fuhrpark und Standorte hochwertig präsentieren\n• Anfragen mit klaren Wegen statt Informationssuche gewinnen\n\nDer QR-Code führt zu Ihrem persönlichen Einblick. Unverbindlich, direkt und konkret genug, um zu sehen, was für {{Fahrschule}} möglich ist.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
  {
    id: "builtin-vorsprung",
    name: "Früh dabei",
    kickerTemplate: "WEBSITE HEUTE. DIGITALE PLATTFORM MORGEN.",
    headlineTemplate: "Eine Plattform für Fahrschulen, die weiterdenken.",
    bodyTemplate:
      "FahrSeiten beginnt mit einer Website, die sofort Arbeit abnimmt – und wächst zu einer Plattform für den digitalen Fahrschulalltag.\n\n## Heute starten. Morgen weiterfahren.\n• Heute: Website, Inhalte und Anfragen zentral steuern\n• Als Nächstes: Organisation, Kommunikation und Sichtbarkeit erweitern\n• Von Anfang an: persönliche Begleitung durch ENJO MEDIA\n\nWir suchen Fahrschulen, die früh mitgestalten möchten. Der persönliche QR-Code zeigt den aktuellen Stand und gibt Ihnen drei klare Antwortmöglichkeiten.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
  {
    id: "builtin-website-check",
    name: "Website-Check: Aktualität & Rechtstexte",
    kickerTemplate: "EIN KURZER BLICK VON AUSSEN.",
    headlineTemplate: "Bei {{Fahrschule}} ist uns etwas aufgefallen.",
    bodyTemplate:
      "Bei einer kurzen Sichtprüfung Ihres öffentlich erreichbaren Webauftritts ist uns folgender Punkt aufgefallen: {{Kommentar}}\n\nDas ist ausdrücklich keine Rechtsberatung und keine abschließende rechtliche Bewertung. Wir weisen lediglich auf einen möglichen Prüf- und Aktualisierungsbedarf hin.\n\n## Damit Ihre Website einfacher aktuell bleibt\n• Inhalte, Hinweise und Kontaktdaten zentral selbst pflegen\n• Wartungsinformationen ohne technische Umwege veröffentlichen\n• Rechtstexte strukturiert verwalten und Änderungen leichter nachhalten\n\nÜber den persönlichen QR-Code sehen Sie unverbindlich, wie FahrSeiten den laufenden Webaufwand für {{Fahrschule}} reduzieren kann. Wenn das aktuell kein Thema ist, genügt ein Klick – dann melden wir uns dazu nicht weiter.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
] as const;

export async function listPostalLetterTemplates() {
  const stored = await db
    .select()
    .from(postalLetterTemplates)
    .orderBy(asc(postalLetterTemplates.name));
  return [...builtinPostalTemplates, ...stored];
}

export async function savePostalLetterTemplate(
  raw: unknown,
  actorUserId: string,
) {
  const input = letterTemplateSchema.parse(raw);
  const id = createId();
  await db.insert(postalLetterTemplates).values({
    id,
    ...input,
    createdByUserId: actorUserId,
  });
  return id;
}

export function personalizePostalTemplate(
  value: string,
  lead: {
    companyName: string;
    contactName: string | null;
    tags?: string | null;
    researchNote?: string | null;
  },
) {
  const tags = parseSalesLeadTags(lead.tags);
  const fullObservation =
    lead.researchNote?.trim() ||
    tags.join(", ") ||
    "ein möglicher Aktualisierungsbedarf bei einzelnen Inhalten";
  const observation =
    fullObservation.length > 320
      ? `${fullObservation.slice(0, 317).trimEnd()}…`
      : fullObservation;
  return value
    .replaceAll("{{Fahrschule}}", lead.companyName)
    .replaceAll(
      "{{Ansprechpartner}}",
      lead.contactName || "liebes Fahrschul-Team",
    )
    .replaceAll("{{Tags}}", tags.join(", ") || "ohne Zuordnung")
    .replaceAll("{{Kommentar}}", observation);
}
