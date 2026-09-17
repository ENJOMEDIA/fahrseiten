import { parseStoredBlocks } from "./block-schema";
import type { PublishedPage, TenantWebsite } from "./types";

export const demoWebsite: TenantWebsite = {
  tenantId: "10000000-0000-4000-8000-000000000001",
  name: "Fahrschule Morgenrot",
  maintenanceMode: false,
  maintenanceMessage: "Fiktive Vorschau",
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
          actionHref: "/demo/kontakt",
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
        id: "home-classes",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "license_classes",
          heading: "Führerscheinklassen",
          items: [
            {
              id: "class-b",
              position: 0,
              active: true,
              key: "B",
              title: "Pkw",
              description: "Fiktive Beispielausbildung für Pkw.",
              minimumAge: 18,
            },
            {
              id: "class-a",
              position: 1,
              active: true,
              key: "A",
              title: "Motorrad",
              description: "Fiktive Beispielausbildung für Motorräder.",
              minimumAge: 24,
            },
          ],
        },
      },
      {
        id: "home-prices",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "prices",
          heading: "Beispielpreise",
          groups: [
            {
              id: "prices-b",
              position: 0,
              active: true,
              title: "Klasse B",
              items: [
                {
                  id: "price-base",
                  position: 0,
                  active: true,
                  label: "Grundbetrag",
                  amount: "499.00",
                  currency: "EUR",
                },
                {
                  id: "price-drive",
                  position: 1,
                  active: true,
                  label: "Fahrstunde",
                  amount: "69.00",
                  currency: "EUR",
                  unit: "45 Minuten",
                },
              ],
            },
          ],
        },
      },
      {
        id: "home-courses",
        schemaVersion: 1,
        position: 4,
        visible: true,
        properties: {
          type: "courses",
          heading: "Kurse",
          items: [
            {
              id: "course-theory",
              position: 0,
              active: true,
              title: "Theorie-Intensivkurs",
              description: "Fiktiver Kompaktkurs ohne Buchungsfunktion.",
              dates: [
                {
                  id: "date-1",
                  startsAt: "2026-10-12T16:00:00+02:00",
                  endsAt: "2026-10-12T19:00:00+02:00",
                  timezone: "Europe/Berlin",
                },
              ],
            },
          ],
        },
      },
      {
        id: "home-team",
        schemaVersion: 1,
        position: 5,
        visible: true,
        properties: {
          type: "team",
          heading: "Unser Demo-Team",
          items: [
            {
              id: "team-1",
              position: 0,
              active: true,
              name: "Mara Beispiel",
              role: "Fahrlehrerin",
              bio: "Fiktive Person für die lokale Produktdemo.",
              qualifications: ["Klassen A und B"],
            },
          ],
        },
      },
      {
        id: "home-fleet",
        schemaVersion: 1,
        position: 6,
        visible: true,
        properties: {
          type: "fleet",
          heading: "Fuhrpark",
          items: [
            {
              id: "vehicle-1",
              position: 0,
              active: true,
              name: "Demo Kompakt",
              category: "Pkw",
              transmission: "automatic",
              description:
                "Fiktives, elektrisch angetriebenes Schulungsfahrzeug.",
            },
          ],
        },
      },
      {
        id: "home-locations",
        schemaVersion: 1,
        position: 7,
        visible: true,
        properties: {
          type: "locations",
          heading: "Standort",
          items: [
            {
              id: "location-1",
              position: 0,
              active: true,
              name: "Morgenrot Lernstudio",
              street: "Beispielweg 1",
              postalCode: "00000",
              city: "Musterstadt",
              phone: "+49 30 0000000",
              email: "hallo@morgenrot.invalid",
              openingHours: [
                {
                  weekday: 1,
                  opensAt: "10:00",
                  closesAt: "18:00",
                  closed: false,
                },
                { weekday: 7, closed: true },
              ],
            },
          ],
        },
      },
      {
        id: "home-testimonials",
        schemaVersion: 1,
        position: 8,
        visible: true,
        properties: {
          type: "testimonials",
          heading: "Fiktive Stimmen",
          items: [
            {
              id: "testimonial-1",
              position: 0,
              active: true,
              displayName: "Alex Demo",
              quote: "Die Abläufe waren klar und verständlich erklärt.",
              rating: 5,
              sourceLabel: "manuell gepflegte Demo",
            },
          ],
        },
      },
      {
        id: "home-faq",
        schemaVersion: 1,
        position: 9,
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
        position: 10,
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
