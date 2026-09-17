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
