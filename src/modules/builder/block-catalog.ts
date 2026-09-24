import type { BlockProperties } from "@/modules/cms/block-schema";

export const builderBlockCatalog = {
  hero: { label: "Großer Einstieg", group: "layout" },
  text_image: { label: "Text mit Bild", group: "layout" },
  benefits: { label: "Vorteile", group: "layout" },
  cta: { label: "Handlungsaufruf", group: "layout" },
  faq: { label: "Fragen & Antworten", group: "layout" },
  contact_teaser: { label: "Kontaktteaser", group: "layout" },
  license_classes: { label: "Führerscheinklassen", group: "content" },
  prices: { label: "Preise", group: "content" },
  courses: { label: "Kurse", group: "content" },
  team: { label: "Team", group: "content" },
  fleet: { label: "Fuhrpark", group: "content" },
  locations: { label: "Standorte", group: "content" },
  testimonials: { label: "Bewertungen", group: "content" },
} as const;

export type BuilderBlockType = keyof typeof builderBlockCatalog;

export function createBuilderBlockProperties(
  type: BuilderBlockType,
): BlockProperties {
  const defaults: Record<BuilderBlockType, BlockProperties> = {
    hero: { type: "hero", heading: "Neue Überschrift", text: "Neuer Text" },
    text_image: {
      type: "text_image",
      heading: "Text und Bild",
      paragraphs: ["Neuer Absatz"],
      imageAlt: "",
      imagePosition: "right",
    },
    benefits: {
      type: "benefits",
      heading: "Deine Vorteile",
      items: [{ title: "Vorteil", text: "Kurze Beschreibung" }],
    },
    cta: {
      type: "cta",
      heading: "Bereit für den nächsten Schritt?",
      text: "Neuer Text",
      actionLabel: "Mehr erfahren",
      actionHref: "/",
    },
    faq: {
      type: "faq",
      heading: "Häufige Fragen",
      items: [{ question: "Neue Frage", answer: "Neue Antwort" }],
    },
    contact_teaser: {
      type: "contact_teaser",
      heading: "Lass uns über deinen Führerschein sprechen",
      text: "Du hast Fragen zu Klassen, Ablauf oder Anmeldung? Ruf uns an oder schreib uns – wir beraten dich persönlich und ohne Umwege.",
    },
    license_classes: {
      type: "license_classes",
      heading: "Führerscheinklassen",
      items: [],
    },
    prices: { type: "prices", heading: "Preise", groups: [] },
    courses: { type: "courses", heading: "Kurse", items: [] },
    team: { type: "team", heading: "Unser Team", items: [] },
    fleet: { type: "fleet", heading: "Unser Fuhrpark", items: [] },
    locations: { type: "locations", heading: "Unsere Standorte", items: [] },
    testimonials: {
      type: "testimonials",
      heading: "Stimmen unserer Fahrschüler",
      items: [],
    },
  };
  return structuredClone(defaults[type]);
}
