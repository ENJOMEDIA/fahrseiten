import type { FeatureKey } from "@/modules/features/catalog";

export type CustomerNavigationItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
  group: string;
  feature?: FeatureKey;
  planned?: boolean;
};

export const customerNavigation: readonly CustomerNavigationItem[] = [
  {
    href: "/kunde",
    label: "Dashboard",
    icon: "⌂",
    description: "Dein aktueller Überblick",
    group: "Start",
  },
  {
    href: "/kunde/einrichtung",
    label: "Einrichtungsassistent",
    icon: "✓",
    description: "Geführt zu deiner fertigen Website",
    group: "Start",
  },
  {
    href: "/kunde/website",
    label: "Website",
    icon: "W",
    description: "Seiten gestalten und veröffentlichen",
    group: "Website",
    feature: "managed_website",
  },
  {
    href: "/kunde/inhalte",
    label: "Inhalte",
    icon: "I",
    description: "Angebote, Team und Standorte",
    group: "Website",
    feature: "content_modules",
  },
  {
    href: "/kunde/medien",
    label: "Medien",
    icon: "▧",
    description: "Bilder und Dateien",
    group: "Website",
  },
  {
    href: "/kunde/domain",
    label: "Domain",
    icon: "◎",
    description: "Adresse und SSL-Status",
    group: "Website",
    feature: "custom_domain",
  },
  {
    href: "/kunde/anfragen",
    label: "Anfragen",
    icon: "@",
    description: "Anfragen beantworten",
    group: "Kommunikation",
    planned: true,
  },
  {
    href: "/kunde/abrechnung",
    label: "Vertrag & Rechnungen",
    icon: "€",
    description: "Laufzeit, Fälligkeit und Belege",
    group: "Verwaltung",
  },
  {
    href: "/kunde/empfehlungen",
    label: "Weiterempfehlen",
    icon: "✦",
    description: "Link teilen und Monatsbonus verfolgen",
    group: "Verwaltung",
  },
  {
    href: "/kunde/rechtliches",
    label: "Rechtliches",
    icon: "§",
    description: "Geführte Pflichtangaben",
    group: "Verwaltung",
    feature: "legal_consent",
  },
  {
    href: "/kunde/benutzer",
    label: "Teamzugänge",
    icon: "B",
    description: "Benutzer und Rollen",
    group: "Verwaltung",
    planned: true,
  },
  {
    href: "/kunde/funktionen",
    label: "Funktionen",
    icon: "+",
    description: "Aktive und geplante Module",
    group: "Verwaltung",
  },
  {
    href: "/kunde/einstellungen",
    label: "Einstellungen",
    icon: "⚙",
    description: "Website und Wartungsmodus",
    group: "Verwaltung",
    feature: "maintenance_preview",
  },
  {
    href: "/kunde/fehler-melden",
    label: "Fehler melden",
    icon: "!",
    description: "Hilfe mit Referenznummer",
    group: "Hilfe",
  },
] as const;

export const contentModules = {
  fuehrerscheinklassen: {
    title: "Führerscheinklassen",
    singular: "Führerscheinklasse",
  },
  preise: {
    title: "Preise",
    singular: "Preisposition",
  },
  kurse: { title: "Kurse", singular: "Kurs" },
  team: { title: "Team", singular: "Teammitglied" },
  fahrzeuge: {
    title: "Fahrzeuge",
    singular: "Fahrzeug",
  },
  standorte: {
    title: "Standorte & Öffnungszeiten",
    singular: "Standort",
  },
  bewertungen: {
    title: "Bewertungen",
    singular: "Bewertung",
  },
} as const;
