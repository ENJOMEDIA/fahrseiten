import "server-only";

import { asc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { postalLetterTemplates } from "@/db/schema";
import { createId } from "@/lib/ids";

const letterTemplateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  headlineTemplate: z.string().trim().min(10).max(180),
  bodyTemplate: z.string().trim().min(80).max(1_200),
  active: z.boolean().default(true),
});

export const builtinPostalTemplates = [
  {
    id: "builtin-einfach-aktuell",
    name: "Weniger Website-Stress",
    headlineTemplate: "Ihre Website sollte mitfahren – nicht aufhalten.",
    bodyTemplate:
      "Preise ändern, ein neues Fahrzeug vorstellen oder den nächsten Kurs veröffentlichen: Dafür sollte {{Fahrschule}} weder auf eine Agentur warten noch sich mit Technik beschäftigen müssen. FahrSeiten verbindet einen modernen Webauftritt mit einem klaren Arbeitsbereich, in dem Sie die wichtigen Inhalte selbst pflegen.\n\nDer persönliche QR-Code zeigt Ihnen in wenigen Minuten, wie aus laufendem Website-Aufwand ein einfacher Teil Ihres Alltags werden kann. Schauen Sie unverbindlich hinein – vielleicht ist genau das die Lösung, die bisher gefehlt hat.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
  {
    id: "builtin-erster-eindruck",
    name: "Der erste Eindruck fährt mit",
    headlineTemplate: "Der erste Eindruck von {{Fahrschule}} beginnt online.",
    bodyTemplate:
      "Noch bevor jemand bei Ihnen anruft, entsteht online bereits ein Gefühl: modern und vertrauenswürdig – oder kompliziert und nicht mehr ganz aktuell. FahrSeiten wurde speziell dafür entwickelt, Fahrschulen hochwertig zu präsentieren und die Pflege trotzdem angenehm einfach zu halten.\n\nKlassen, Kurse, Preise, Fahrzeuge, Team und Standorte greifen in einem stimmigen Auftritt zusammen. Über Ihren persönlichen QR-Code sehen Sie, was daraus für {{Fahrschule}} entstehen kann – ohne Verpflichtung, aber mit einem ziemlich konkreten Eindruck.",
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    createdByUserId: null,
  },
  {
    id: "builtin-vorsprung",
    name: "Früh dabei",
    headlineTemplate: "Eine Plattform für Fahrschulen, die weiterdenken.",
    bodyTemplate:
      "Mit FahrSeiten baut ENJO MEDIA eine Plattform, die bei der Website beginnt und den digitalen Alltag von Fahrschulen Schritt für Schritt einfacher macht. Heute stehen ein moderner Webauftritt, selbst pflegbare Inhalte und strukturierte Anfragen im Mittelpunkt. Weitere Werkzeuge für Organisation, Kommunikation und Sichtbarkeit folgen.\n\nWir suchen bewusst Fahrschulen, die früh dabei sein und von persönlicher Begleitung profitieren möchten. Scannen Sie Ihren individuellen QR-Code und entscheiden Sie selbst: direkt kennenlernen, erst weitere Informationen erhalten oder keine weitere Ansprache wünschen.",
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
  lead: { companyName: string; contactName: string | null },
) {
  return value
    .replaceAll("{{Fahrschule}}", lead.companyName)
    .replaceAll(
      "{{Ansprechpartner}}",
      lead.contactName || "liebes Fahrschul-Team",
    );
}
