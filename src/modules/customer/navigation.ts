import type { FeatureKey } from "@/modules/features/catalog";

export type CustomerNavigationItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
  feature?: FeatureKey;
  planned?: boolean;
};

export const customerNavigation: readonly CustomerNavigationItem[] = [
  {
    href: "/kunde",
    label: "Dashboard",
    icon: "⌂",
    description: "Dein aktueller Überblick",
  },
  {
    href: "/kunde/website",
    label: "Website",
    icon: "W",
    description: "Seiten gestalten und veröffentlichen",
    feature: "managed_website",
  },
  {
    href: "/kunde/inhalte",
    label: "Inhalte",
    icon: "I",
    description: "Angebote, Team und Standorte",
    feature: "content_modules",
  },
  {
    href: "/kunde/medien",
    label: "Medien",
    icon: "▧",
    description: "Bilder und Dateien",
  },
  {
    href: "/kunde/anfragen",
    label: "Anfragen",
    icon: "@",
    description: "Anfragen beantworten",
    planned: true,
  },
  {
    href: "/kunde/domain",
    label: "Domain",
    icon: "◎",
    description: "Adresse und SSL-Status",
    feature: "custom_domain",
  },
  {
    href: "/kunde/abrechnung",
    label: "Vertrag & Rechnungen",
    icon: "€",
    description: "Laufzeit, Fälligkeit und Belege",
  },
  {
    href: "/kunde/rechtliches",
    label: "Rechtliches",
    icon: "§",
    description: "Geführte Pflichtangaben",
    feature: "legal_consent",
  },
  {
    href: "/kunde/benutzer",
    label: "Teamzugänge",
    icon: "B",
    description: "Benutzer und Rollen",
    planned: true,
  },
  {
    href: "/kunde/funktionen",
    label: "Funktionen",
    icon: "+",
    description: "Aktive und geplante Module",
  },
  {
    href: "/kunde/einstellungen",
    label: "Einstellungen",
    icon: "⚙",
    description: "Website und Wartungsmodus",
    feature: "maintenance_preview",
  },
  {
    href: "/kunde/fehler-melden",
    label: "Fehler melden",
    icon: "!",
    description: "Hilfe mit Referenznummer",
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
} as const;
