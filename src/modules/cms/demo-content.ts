import { parseStoredBlocks } from "./block-schema";
import type { PublishedPage, TenantWebsite } from "./types";

const tenantId = "10000000-0000-4000-8000-000000000001";

export const demoWebsite: TenantWebsite = {
  tenantId,
  name: "Fahrschule Morgenrot",
  maintenanceMode: false,
  maintenanceMessage: "Beispiel-Website",
  basePath: "/demo",
  navigation: [
    { id: "nav-home", label: "Start", href: "/demo", position: 0 },
    {
      id: "nav-training",
      label: "Ausbildung",
      href: "/demo/ausbildung",
      position: 1,
    },
    { id: "nav-fleet", label: "Fuhrpark", href: "/demo/fuhrpark", position: 2 },
    {
      id: "nav-about",
      label: "Über uns",
      href: "/demo/ueber-uns",
      position: 3,
    },
    { id: "nav-contact", label: "Kontakt", href: "/demo/kontakt", position: 4 },
  ],
  theme: {
    themeKey: "urban_night",
    primaryColor: "#2563eb",
    accentColor: "#020617",
  },
};

const licenseItems = [
  {
    id: "class-b",
    position: 0,
    active: true,
    key: "B",
    title: "Pkw",
    description:
      "Dein Weg in die mobile Freiheit – strukturiert, persönlich und mit moderner Lernbegleitung.",
    minimumAge: 18,
  },
  {
    id: "class-b197",
    position: 1,
    active: true,
    key: "B197",
    title: "Automatik mit Schaltkompetenz",
    description:
      "Entspannt lernen und nach den vorgeschriebenen Schaltstunden flexibel unterwegs sein.",
    minimumAge: 18,
  },
  {
    id: "class-a",
    position: 2,
    active: true,
    key: "A",
    title: "Motorrad",
    description:
      "Sicheres Handling, vorausschauendes Fahren und echte Freude auf zwei Rädern.",
    minimumAge: 24,
  },
];

const fleetItems = [
  {
    id: "vehicle-blue",
    position: 0,
    active: true,
    name: "Morgenrot Blue",
    category: "Klasse B",
    transmission: "manual" as const,
    description:
      "Direktes Fahrgefühl, moderne Assistenzsysteme und ein übersichtliches Cockpit für deine Schaltausbildung.",
    imageUrl: "/demo/fleet-blue.webp",
    imageAlt: "Blauer kompakter Fahrschulwagen vor einem modernen Gebäude",
  },
  {
    id: "vehicle-electric",
    position: 1,
    active: true,
    name: "Morgenrot Electric",
    category: "B197 & B",
    transmission: "automatic" as const,
    description:
      "Leise, intuitiv und elektrisch: konzentriere dich ganz auf Verkehr, Blickführung und sicheres Entscheiden.",
    imageUrl: "/demo/fleet-electric.webp",
    imageAlt: "Weißer elektrischer Fahrschulwagen auf einem Übungsplatz",
  },
];

const pages: PublishedPage[] = [
  {
    tenantId,
    slug: "",
    title: "Start",
    version: 2,
    seo: {
      title: "Fahrschule Morgenrot – Deine Fahrt beginnt hier",
      description: "Beispiel-Website mit vollständig fiktiven Inhalten.",
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
          eyebrow: "Fahrausbildung neu gedacht",
          heading: "Deine Fahrt. Dein Tempo. Dein Moment.",
          text: "Vom ersten Theorieabend bis zur Prüfung: Wir machen deinen Weg zum Führerschein klar, persönlich und überraschend entspannt.",
          actionLabel: "Ausbildung entdecken",
          actionHref: "/demo/ausbildung",
          imageUrl: "/demo/hero-driving-school.webp",
          imageAlt: "Türkiser Fahrschulwagen fährt durch eine moderne Stadt",
        },
      },
      {
        id: "home-benefits",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "benefits",
          heading: "Fahren lernen, ohne den Überblick zu verlieren.",
          items: [
            {
              title: "Ein klarer Fahrplan",
              text: "Du weißt jederzeit, was als Nächstes ansteht – von den Unterlagen bis zur praktischen Prüfung.",
            },
            {
              title: "Training, das zu dir passt",
              text: "Persönliche Begleitung, verständliche Erklärungen und Termine passend zu deinem Alltag.",
            },
            {
              title: "Modern aufgestellt",
              text: "Aktuelle Fahrzeuge, digitale Abläufe und transparente Informationen an einem Ort.",
            },
          ],
        },
      },
      {
        id: "home-story",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "text_image",
          heading: "Eine Fahrschule, die dir Sicherheit gibt.",
          paragraphs: [
            "Fahren lernen ist aufregend. Darum nehmen wir uns Zeit, erklären verständlich und bauen jede Fahrstunde auf deinem persönlichen Fortschritt auf.",
            "Bei uns triffst du auf ein ruhiges Team, moderne Fahrzeuge und einen Ablauf, der sich nicht komplizierter macht als nötig.",
          ],
          imageUrl: "/demo/fleet-electric.webp",
          imageAlt:
            "Modernes elektrisches Fahrschulfahrzeug der Beispiel-Fahrschule",
          imagePosition: "left",
        },
      },
      {
        id: "home-classes",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "license_classes",
          heading: "Welcher Führerschein passt zu deinem nächsten Kapitel?",
          items: licenseItems,
        },
      },
      {
        id: "home-fleet",
        schemaVersion: 1,
        position: 4,
        visible: true,
        properties: {
          type: "fleet",
          heading: "Dein Lernplatz auf vier Rädern.",
          items: fleetItems,
        },
      },
      {
        id: "home-testimonials",
        schemaVersion: 1,
        position: 5,
        visible: true,
        properties: {
          type: "testimonials",
          heading: "So könnte sich eine gute Ausbildung anfühlen.",
          items: [
            {
              id: "voice-1",
              position: 0,
              active: true,
              displayName: "Lea, 19",
              quote:
                "Ich wusste immer, wo ich stehe. Das hat mir vor der Prüfung unglaublich viel Ruhe gegeben.",
              rating: 5,
              sourceLabel: "fiktive Beispielstimme",
            },
            {
              id: "voice-2",
              position: 1,
              active: true,
              displayName: "Noah, 23",
              quote:
                "Geduldig erklärt, flexibel geplant und im Auto sofort wohlgefühlt. Genau so hatte ich es mir gewünscht.",
              rating: 5,
              sourceLabel: "fiktive Beispielstimme",
            },
            {
              id: "voice-3",
              position: 2,
              active: true,
              displayName: "Mila, 31",
              quote:
                "Mit B197 konnte ich entspannt starten und trotzdem das Schalten sicher lernen.",
              rating: 5,
              sourceLabel: "fiktive Beispielstimme",
            },
          ],
        },
      },
      {
        id: "home-faq",
        schemaVersion: 1,
        position: 6,
        visible: true,
        properties: {
          type: "faq",
          heading: "Fragen, die vor dem Start wichtig sind.",
          items: [
            {
              question: "Wie läuft die Anmeldung ab?",
              answer:
                "Nach deiner Anfrage besprechen wir Klasse, Zeitplan und benötigte Unterlagen. Anschließend erhältst du einen klaren Überblick über die nächsten Schritte.",
            },
            {
              question: "Kann ich mit Automatik beginnen?",
              answer:
                "Ja. Auf dieser Beispiel-Website wird auch die Ausbildung B197 gezeigt, bei der Automatik und vorgeschriebene Schaltkompetenz verbunden werden.",
            },
            {
              question: "Sind Preise und Termine auf dieser Seite echt?",
              answer:
                "Nein. Morgenrot ist eine vollständig fiktive Fahrschule. Alle Namen, Preise, Termine, Bewertungen und Kontaktdaten dienen nur als Produktbeispiel.",
            },
          ],
        },
      },
      {
        id: "home-contact",
        schemaVersion: 1,
        position: 7,
        visible: true,
        properties: {
          type: "contact_teaser",
          heading: "Bereit für deinen ersten Schritt?",
          text: "Sag uns, was du vorhast. In einem kurzen Gespräch klären wir, welche Ausbildung zu dir passt.",
          phone: "+49 30 0000000",
          email: "hallo@morgenrot.invalid",
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "ausbildung",
    title: "Ausbildung",
    version: 1,
    seo: {
      title: "Ausbildung & Preise – Fahrschule Morgenrot",
      description: "Fiktive Klassen, Kurse und Preise der Beispiel-Website.",
      noIndex: true,
    },
    blocks: parseStoredBlocks([
      {
        id: "training-hero",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "hero",
          eyebrow: "Ausbildung mit System",
          heading: "Dein Führerschein beginnt mit einem guten Plan.",
          text: "Wähle deine Klasse, entdecke passende Kurse und behalte die Beispielkosten von Anfang an im Blick.",
          actionLabel: "Unverbindlich anfragen",
          actionHref: "/demo/kontakt",
          imageUrl: "/demo/hero-driving-school.webp",
          imageAlt: "Fahrschulwagen in einer modernen Stadt",
        },
      },
      {
        id: "training-classes",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "license_classes",
          heading: "Drei Wege. Ein Ziel: sicher ankommen.",
          items: licenseItems,
        },
      },
      {
        id: "training-prices",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "prices",
          heading: "Beispielpreise, die du sofort verstehst.",
          groups: [
            {
              id: "prices-b",
              position: 0,
              active: true,
              title: "Klasse B",
              items: [
                {
                  id: "b-base",
                  position: 0,
                  active: true,
                  label: "Grundbetrag",
                  amount: "499.00",
                  currency: "EUR" as const,
                },
                {
                  id: "b-drive",
                  position: 1,
                  active: true,
                  label: "Übungsfahrt",
                  amount: "69.00",
                  currency: "EUR" as const,
                  unit: "45 Minuten",
                },
                {
                  id: "b-special",
                  position: 2,
                  active: true,
                  label: "Sonderfahrt",
                  amount: "79.00",
                  currency: "EUR" as const,
                  unit: "45 Minuten",
                },
              ],
            },
            {
              id: "prices-b197",
              position: 1,
              active: true,
              title: "Klasse B197",
              items: [
                {
                  id: "b197-base",
                  position: 0,
                  active: true,
                  label: "Grundbetrag",
                  amount: "549.00",
                  currency: "EUR" as const,
                },
                {
                  id: "b197-auto",
                  position: 1,
                  active: true,
                  label: "Automatikstunde",
                  amount: "72.00",
                  currency: "EUR" as const,
                  unit: "45 Minuten",
                },
                {
                  id: "b197-switch",
                  position: 2,
                  active: true,
                  label: "Schaltstunde",
                  amount: "69.00",
                  currency: "EUR" as const,
                  unit: "45 Minuten",
                },
              ],
            },
          ],
        },
      },
      {
        id: "training-courses",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "courses",
          heading: "Termine, die in deinen Kalender passen.",
          items: [
            {
              id: "course-intensive",
              position: 0,
              active: true,
              title: "Theorie-Intensivkurs",
              description:
                "Alle Pflichtlektionen kompakt in zwei Wochen – mit Zeit für Fragen und Wiederholung.",
              dates: [
                {
                  id: "intensive-oct",
                  startsAt: "2026-10-12T16:00:00+02:00",
                  endsAt: "2026-10-23T19:00:00+02:00",
                  timezone: "Europe/Berlin",
                },
              ],
            },
            {
              id: "course-first-aid",
              position: 1,
              active: true,
              title: "Erste-Hilfe-Tag",
              description:
                "Praxisnaher Partnerkurs als Beispiel für zusätzliche Termine auf der Website.",
              dates: [
                {
                  id: "aid-oct",
                  startsAt: "2026-10-24T09:00:00+02:00",
                  endsAt: "2026-10-24T16:30:00+02:00",
                  timezone: "Europe/Berlin",
                },
              ],
            },
          ],
        },
      },
      {
        id: "training-cta",
        schemaVersion: 1,
        position: 4,
        visible: true,
        properties: {
          type: "cta",
          heading: "Noch unsicher, welche Klasse passt?",
          text: "Wir sortieren Voraussetzungen, Ablauf und Beispielkosten gemeinsam mit dir.",
          actionLabel: "Gespräch anfragen",
          actionHref: "/demo/kontakt",
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "fuhrpark",
    title: "Fuhrpark",
    version: 1,
    seo: {
      title: "Fuhrpark – Fahrschule Morgenrot",
      description: "Fiktiver Fuhrpark der Beispiel-Website.",
      noIndex: true,
    },
    blocks: parseStoredBlocks([
      {
        id: "fleet-hero",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "hero",
          eyebrow: "Dein Platz zum Lernen",
          heading: "Technik, die Sicherheit leicht macht.",
          text: "Schaltung oder Automatik, klassisch oder elektrisch: Du lernst in einem Umfeld, in dem du dich auf das Wesentliche konzentrieren kannst.",
          actionLabel: "Probefahrt anfragen",
          actionHref: "/demo/kontakt",
          imageUrl: "/demo/fleet-blue.webp",
          imageAlt: "Blauer Fahrschulwagen vor dem Schulungsgebäude",
        },
      },
      {
        id: "fleet-list",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "fleet",
          heading: "Zwei Fahrzeuge. Viele Möglichkeiten.",
          items: fleetItems,
        },
      },
      {
        id: "fleet-benefits",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "benefits",
          heading: "Damit du dich vom ersten Moment an wohlfühlst.",
          items: [
            {
              title: "Übersichtlich",
              text: "Klare Cockpits und gute Rundumsicht unterstützen dich in jeder Lernphase.",
            },
            {
              title: "Aktuell",
              text: "Assistenzsysteme werden verständlich erklärt und sinnvoll in die Ausbildung integriert.",
            },
            {
              title: "Flexibel",
              text: "Schaltung, Automatik und B197 lassen sich passend zu deinem Ziel kombinieren.",
            },
          ],
        },
      },
      {
        id: "fleet-cta",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "cta",
          heading: "Welches Fahrzeug passt zu dir?",
          text: "Lerne beide Varianten kennen und entscheide mit einem sicheren Gefühl.",
          actionLabel: "Kontakt aufnehmen",
          actionHref: "/demo/kontakt",
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "ueber-uns",
    title: "Über uns",
    version: 2,
    seo: { title: "Über uns – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "about-hero",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "hero",
          eyebrow: "Fiktiv. Aber realistisch gedacht.",
          heading: "Menschen, die dir etwas zutrauen.",
          text: "Unsere Beispiel-Fahrschule zeigt, wie Persönlichkeit, klare Inhalte und moderne Gestaltung zusammenwirken können.",
          actionLabel: "Team kennenlernen",
          actionHref: "/demo/ueber-uns#team",
          imageUrl: "/demo/hero-driving-school.webp",
          imageAlt: "Fahrschulwagen der fiktiven Fahrschule Morgenrot",
        },
      },
      {
        id: "about-story",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "text_image",
          heading: "Geduld ist bei uns kein Extra.",
          paragraphs: [
            "Morgenrot ist ein fiktives Beispiel. Die Haltung dahinter ist trotzdem konkret: Gute Ausbildung beginnt mit Zuhören, klaren Erklärungen und einem Plan, den Fahrschüler wirklich verstehen.",
            "Alle Abschnitte dieser Website stammen aus kontrollierten FahrSeiten-Bausteinen. Inhalte können gepflegt werden, ohne dabei Gestaltung und mobile Darstellung aus dem Blick zu verlieren.",
          ],
          imageUrl: "/demo/fleet-electric.webp",
          imageAlt: "Elektrisches Ausbildungsfahrzeug in heller Umgebung",
          imagePosition: "right",
        },
      },
      {
        id: "about-team",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "team",
          heading: "Ein Team, das Ruhe ins Lernen bringt.",
          items: [
            {
              id: "team-mara",
              position: 0,
              active: true,
              name: "Mara Beispiel",
              role: "Fahrlehrerin & Inhaberin",
              bio: "Erklärt präzise, bleibt ruhig und findet für jede Lernsituation einen neuen Blickwinkel.",
              qualifications: [
                "Klassen A & B",
                "B197",
                "Ausbildungsfahrlehrerin",
              ],
            },
            {
              id: "team-jan",
              position: 1,
              active: true,
              name: "Jan Muster",
              role: "Fahrlehrer",
              bio: "Verbindet lockere Fahrstunden mit klarer Struktur und ehrlichem Feedback.",
              qualifications: ["Klasse B", "Automatik", "Theorieunterricht"],
            },
            {
              id: "team-lina",
              position: 2,
              active: true,
              name: "Lina Beispiel",
              role: "Organisation",
              bio: "Behält Termine und Unterlagen im Blick und macht den Einstieg angenehm unkompliziert.",
              qualifications: ["Anmeldung", "Terminplanung", "Erstberatung"],
            },
          ],
        },
      },
      {
        id: "about-locations",
        schemaVersion: 1,
        position: 3,
        visible: true,
        properties: {
          type: "locations",
          heading: "Hier könnte Ausbildung zuhause sein.",
          items: [
            {
              id: "location-city",
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
                {
                  weekday: 3,
                  opensAt: "10:00",
                  closesAt: "18:00",
                  closed: false,
                },
                {
                  weekday: 5,
                  opensAt: "10:00",
                  closesAt: "16:00",
                  closed: false,
                },
              ],
            },
            {
              id: "location-north",
              position: 1,
              active: true,
              name: "Treffpunkt Nord",
              street: "Musterallee 24",
              postalCode: "00000",
              city: "Musterstadt",
              phone: "+49 30 0000000",
              email: "hallo@morgenrot.invalid",
              openingHours: [
                {
                  weekday: 2,
                  opensAt: "12:00",
                  closesAt: "19:00",
                  closed: false,
                },
                {
                  weekday: 4,
                  opensAt: "12:00",
                  closesAt: "19:00",
                  closed: false,
                },
              ],
            },
          ],
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "kontakt",
    title: "Kontakt",
    version: 2,
    seo: { title: "Kontakt – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "contact-hero",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "hero",
          eyebrow: "Der erste Schritt ist leicht",
          heading: "Sag Hallo. Wir klären den Rest.",
          text: "Welche Klasse, welche Unterlagen, welcher Zeitplan? Zeige Interessenten klare Kontaktwege und einen verständlichen nächsten Schritt.",
          actionLabel: "Kontaktdaten ansehen",
          actionHref: "/demo/kontakt#kontakt",
          imageUrl: "/demo/hero-driving-school.webp",
          imageAlt: "Moderner Fahrschulwagen in der Stadt",
        },
      },
      {
        id: "contact-details",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "contact_teaser",
          heading: "Direkt, freundlich und ohne Fachchinesisch.",
          text: "Diese Kontaktdaten sind bewusst ungültige Beispieldaten. Der Kontaktteaser entspricht genau dem Block, den Kunden im Builder einsetzen können.",
          phone: "+49 30 0000000",
          email: "hallo@morgenrot.invalid",
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "impressum",
    title: "Impressum",
    version: 2,
    seo: { title: "Impressum – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "legal-imprint",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "text_image",
          heading: "Impressum der Beispiel-Fahrschule",
          paragraphs: [
            "Fahrschule Morgenrot ist ein vollständig fiktives Anschauungsbeispiel. Beispielweg 1, 00000 Musterstadt.",
            "Vertreten durch: Mara Beispiel. Kontakt: hallo@morgenrot.invalid. Es findet kein realer Geschäftsbetrieb statt.",
            "Die produktive Plattform erzeugt rechtliche Inhaltsbausteine anhand der gepflegten Stammdaten und aktivierten Module. Die verantwortliche Fahrschule muss diese Angaben vor Veröffentlichung prüfen.",
          ],
          imageAlt: "Abstrakte Bildfläche für rechtliche Angaben",
          imagePosition: "right",
        },
      },
    ]),
  },
  {
    tenantId,
    slug: "datenschutz",
    title: "Datenschutz",
    version: 2,
    seo: { title: "Datenschutz – Fahrschule Morgenrot", noIndex: true },
    blocks: parseStoredBlocks([
      {
        id: "legal-privacy",
        schemaVersion: 1,
        position: 0,
        visible: true,
        properties: {
          type: "text_image",
          heading: "Datenschutz auf dieser Beispiel-Website",
          paragraphs: [
            "Diese Beispiel-Website verwendet ausschließlich fiktive Inhalte. Bitte gib im Kontaktformular keine echten Personen- oder Kundendaten ein.",
            "Auf einer Kundenseite erzeugt FahrSeiten Datenschutzbausteine passend zu den aktivierten Funktionen und Einwilligungen. Die verantwortliche Fahrschule prüft und veröffentlicht die Angaben.",
          ],
          imageAlt: "Abstrakte Bildfläche zum Datenschutz",
          imagePosition: "right",
        },
      },
    ]),
  },
];

export function findDemoPage(slug: string): PublishedPage | null {
  return pages.find((page) => page.slug === slug) ?? null;
}
export const demoPages = pages;
