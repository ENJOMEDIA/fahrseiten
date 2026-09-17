export const customerNavigation = [
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
  },
  {
    href: "/kunde/inhalte",
    label: "Inhalte",
    icon: "I",
    description: "Angebote, Team und Standorte",
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
    description: "Interessenten beantworten",
  },
  {
    href: "/kunde/domain",
    label: "Domain",
    icon: "◎",
    description: "Adresse und SSL-Status",
  },
  {
    href: "/kunde/rechtliches",
    label: "Rechtliches",
    icon: "§",
    description: "Geführte Pflichtangaben",
  },
  {
    href: "/kunde/benutzer",
    label: "Teamzugänge",
    icon: "B",
    description: "Benutzer und Rollen",
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
