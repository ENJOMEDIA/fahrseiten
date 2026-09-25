import type { BlockProperties } from "@/modules/cms/block-schema";

export const builderBlockCatalog = {
  hero: {
    label: "Großer Einstieg",
    description: "Starke Überschrift, kurzer Text, Bild und Hauptbutton.",
    group: "layout",
  },
  text_image: {
    label: "Text mit Bild",
    description: "Erklärt ein Thema ausführlicher und persönlich.",
    group: "layout",
  },
  benefits: {
    label: "Vorteile",
    description: "Drei klare Gründe, warum Fahrschüler euch wählen.",
    group: "layout",
  },
  cta: {
    label: "Handlungsaufruf",
    description: "Lenkt Besucher gezielt zu Kontakt oder Anmeldung.",
    group: "layout",
  },
  faq: {
    label: "Fragen & Antworten",
    description: "Beantwortet häufige Fragen übersichtlich.",
    group: "layout",
  },
  contact_teaser: {
    label: "Kontaktteaser",
    description: "Zeigt eure gepflegten Kontaktdaten als Abschluss.",
    group: "layout",
  },
  license_classes: {
    label: "Führerscheinklassen",
    description: "Übernimmt die Klassen aus euren Inhalten.",
    group: "content",
  },
  prices: {
    label: "Preise",
    description: "Übernimmt gepflegte Preisgruppen und Leistungen.",
    group: "content",
  },
  courses: {
    label: "Kurse",
    description: "Zeigt Kurse und die zugehörigen Termine.",
    group: "content",
  },
  team: {
    label: "Team",
    description: "Stellt Fahrlehrer und Ansprechpartner vor.",
    group: "content",
  },
  fleet: {
    label: "Fuhrpark",
    description: "Zeigt Fahrzeuge, Klassen und Bilder.",
    group: "content",
  },
  locations: {
    label: "Standorte",
    description: "Übernimmt Anschrift, Kontakt und Öffnungszeiten.",
    group: "content",
  },
  testimonials: {
    label: "Bewertungen",
    description: "Zeigt freigegebene Stimmen von Fahrschülern.",
    group: "content",
  },
} as const;

export type BuilderBlockType = keyof typeof builderBlockCatalog;

export function createBuilderBlockProperties(
  type: BuilderBlockType,
): BlockProperties {
  const defaults: Record<BuilderBlockType, BlockProperties> = {
    hero: {
      type: "hero",
      eyebrow: "Deine Fahrschule vor Ort",
      heading: "Sicher lernen. Selbstbewusst fahren.",
      text: "Persönliche Begleitung, moderne Ausbildung und ein Team, das dich zuverlässig bis zur Prüfung begleitet.",
      actionLabel: "Beratung anfragen",
      actionHref: "/kontakt",
    },
    text_image: {
      type: "text_image",
      heading: "Ausbildung, die zu deinem Alltag passt",
      paragraphs: [
        "Vom ersten Gespräch bis zur praktischen Prüfung begleiten wir dich mit einem klaren Plan und persönlichen Ansprechpartnern.",
        "Theorie und Praxis greifen sinnvoll ineinander, damit du sicher und mit einem guten Gefühl ans Ziel kommst.",
      ],
      imageAlt: "",
      imagePosition: "right",
    },
    benefits: {
      type: "benefits",
      heading: "Deine Vorteile",
      items: [
        {
          title: "Persönliche Begleitung",
          text: "Feste Ansprechpartner und ehrliches Feedback während deiner gesamten Ausbildung.",
        },
        {
          title: "Flexible Planung",
          text: "Theorie und Fahrstunden lassen sich verlässlich in deinen Alltag integrieren.",
        },
        {
          title: "Moderne Fahrzeuge",
          text: "Gut ausgestattete Ausbildungsfahrzeuge für sicheres und entspanntes Lernen.",
        },
      ],
    },
    cta: {
      type: "cta",
      heading: "Bereit für den nächsten Schritt?",
      text: "Lass uns gemeinsam klären, welcher Weg zu deinem Führerschein am besten passt.",
      actionLabel: "Kontakt aufnehmen",
      actionHref: "/kontakt",
    },
    faq: {
      type: "faq",
      heading: "Häufige Fragen",
      items: [
        {
          question: "Wie kann ich mich anmelden?",
          answer:
            "Melde dich telefonisch, per E-Mail oder über unser Kontaktformular. Wir besprechen dann die nächsten Schritte.",
        },
        {
          question: "Welche Unterlagen brauche ich?",
          answer:
            "Die benötigten Unterlagen hängen von deiner Führerscheinklasse ab. Wir geben dir eine vollständige Checkliste mit.",
        },
        {
          question: "Wann kann ich starten?",
          answer:
            "Wir informieren dich persönlich über freie Plätze, Theorietermine und den möglichen Ausbildungsbeginn.",
        },
      ],
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
