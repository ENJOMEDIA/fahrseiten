import {
  createBuilderBlockProperties,
  type BuilderBlockType,
} from "./block-catalog";
import type { BlockProperties, StoredBlock } from "@/modules/cms/block-schema";

export const builderPageTemplateKeys = [
  "services",
  "about",
  "contact",
  "blank",
] as const;
export type BuilderPageTemplateKey = (typeof builderPageTemplateKeys)[number];

export const builderPageTemplates: Record<
  BuilderPageTemplateKey,
  {
    name: string;
    description: string;
    suggestedTitle: string;
    suggestedSlug: string;
    blocks: readonly BuilderBlockType[];
  }
> = {
  services: {
    name: "Angebot & Klassen",
    description: "Einstieg, Vorteile, Klassen, Preise und Kontakt.",
    suggestedTitle: "Ausbildung",
    suggestedSlug: "ausbildung",
    blocks: ["hero", "benefits", "license_classes", "prices", "cta"],
  },
  about: {
    name: "Über uns",
    description: "Geschichte, Team, Fuhrpark und persönlicher Abschluss.",
    suggestedTitle: "Über uns",
    suggestedSlug: "ueber-uns",
    blocks: ["hero", "text_image", "team", "fleet", "contact_teaser"],
  },
  contact: {
    name: "Kontakt",
    description: "Kontakt-Einstieg, Standorte, häufige Fragen und Abschluss.",
    suggestedTitle: "Kontakt",
    suggestedSlug: "kontakt",
    blocks: ["hero", "locations", "faq", "contact_teaser"],
  },
  blank: {
    name: "Leere Seite",
    description: "Beginnt ohne Bereiche für einen vollständig eigenen Aufbau.",
    suggestedTitle: "Neue Seite",
    suggestedSlug: "neue-seite",
    blocks: [],
  },
};

export function normalizePageSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function createPageTemplateBlocks(
  template: BuilderPageTemplateKey,
  contentPresets: Partial<Record<BuilderBlockType, BlockProperties>> = {},
  createId: () => string = () => crypto.randomUUID(),
): StoredBlock[] {
  const blocks = builderPageTemplates[template].blocks.map(
    (type, position) => ({
      id: createId(),
      schemaVersion: 1 as const,
      position,
      visible: true,
      properties: structuredClone(
        contentPresets[type] ?? createBuilderBlockProperties(type),
      ),
    }),
  );
  const first = blocks[0];
  if (first?.properties.type === "hero") {
    const copy = {
      services: {
        eyebrow: "Deine Ausbildung",
        heading: "Dein Weg zum Führerschein",
        text: "Entdecke unsere Führerscheinklassen, Leistungen und Preise – verständlich erklärt und persönlich begleitet.",
      },
      about: {
        eyebrow: "Unsere Fahrschule",
        heading: "Menschen, die dich sicher ans Ziel bringen",
        text: "Lerne unser Team, unsere Haltung und die Fahrzeuge kennen, mit denen du dich vom ersten Tag an wohlfühlen sollst.",
      },
      contact: {
        eyebrow: "Wir sind für dich da",
        heading: "Lass uns über deinen Führerschein sprechen",
        text: "Stelle deine Frage oder vereinbare ein persönliches Gespräch. Wir melden uns schnell und unkompliziert bei dir.",
      },
      blank: null,
    }[template];
    if (copy) first.properties = { ...first.properties, ...copy };
  }
  return blocks;
}
