import { parseStoredBlocks } from "./block-schema";
import type { PublishedPage, TenantWebsite } from "./types";

export const demoWebsite: TenantWebsite = {
  tenantId: "10000000-0000-4000-8000-000000000001",
  name: "Fahrschule Morgenrot",
  navigation: [
    { id: "nav-home", label: "Start", href: "/demo", position: 0 },
    {
      id: "nav-about",
      label: "Über uns",
      href: "/demo/ueber-uns",
      position: 1,
    },
    { id: "nav-contact", label: "Kontakt", href: "/demo/kontakt", position: 2 },
  ],
  theme: { primaryColor: "#0891b2", accentColor: "#0f172a" },
};

const pages: PublishedPage[] = [
  {
    tenantId: demoWebsite.tenantId,
    slug: "",
    title: "Sicher ans Ziel",
    version: 1,
    seo: {
      title: "Fahrschule Morgenrot – Demo",
      description: "Fiktive Demo-Fahrschule für FahrSeiten.",
      noIndex: true,
    },
    blocks: parseStoredBlocks([
      {
        id: "home-hero",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "hero",
          eyebrow: "Fiktive Demo-Fahrschule",
          heading: "Sicher ans Ziel – Schritt für Schritt",
          text: "Persönliche Ausbildung, klare Abläufe und ein ruhiges Lernumfeld.",
          actionLabel: "Kontakt aufnehmen",
          actionHref: "/kontakt",
        },
      },
      {
        id: "home-benefits",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "benefits",
          heading: "Darum Morgenrot",
          items: [
            {
              title: "Persönlich",
              text: "Feste Ansprechpersonen begleiten dich.",
            },
            {
              title: "Transparent",
              text: "Leistungen und nächste Schritte bleiben nachvollziehbar.",
            },
            { title: "Flexibel", text: "Lernen passend zu deinem Alltag." },
          ],
        },
      },
      {
        id: "home-faq",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "faq",
          heading: "Häufige Fragen",
          items: [
            {
              question: "Ist das eine echte Fahrschule?",
              answer:
                "Nein. Alle Inhalte dieser Website sind ausschließlich fiktive Demo-Daten.",
            },
            {
              question: "Wie starte ich?",
              answer:
                "Nutze den Kontaktbereich für eine unverbindliche Demo-Anfrage.",
            },
          ],
        },
      },
      {
        id: "home-contact",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "contact_teaser",
          heading: "Noch Fragen?",
          text: "Wir erklären dir den fiktiven Ablauf gern.",
          phone: "+49 30 0000000",
          email: "hallo@morgenrot.invalid",
        },
      },
    ]),
  },
  {
    tenantId: demoWebsite.tenantId,
    slug: "ueber-uns",
    title: "Über uns",
    version: 1,
    seo: { title: "Über uns – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "about",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "text_image",
          heading: "Lernen mit Ruhe und Struktur",
          paragraphs: [
            "Morgenrot ist eine vollständig fiktive Fahrschule für die lokale Produktdemo.",
            "Der kontrollierte Blocktyp gibt Struktur und Darstellung sicher vor.",
          ],
          imageAlt: "Abstrakte Demo-Bildfläche",
          imagePosition: "right",
        },
      },
    ]),
  },
  {
    tenantId: demoWebsite.tenantId,
    slug: "kontakt",
    title: "Kontakt",
    version: 1,
    seo: { title: "Kontakt – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "contact",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "cta",
          heading: "Lass uns sprechen",
          text: "Diese Kontaktdaten sind fiktiv und dienen nur der Demo.",
          actionLabel: "E-Mail schreiben",
          actionHref: "mailto:hallo@morgenrot.invalid",
        },
      },
    ]),
  },
];

export function findDemoPage(slug: string): PublishedPage | null {
  return pages.find((page) => page.slug === slug) ?? null;
}

export const demoPages = pages;
