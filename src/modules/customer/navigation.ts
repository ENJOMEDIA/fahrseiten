export const customerNavigation = [
  { href: "/kunde", label: "Dashboard" },
  { href: "/kunde/website", label: "Website" },
  { href: "/kunde/inhalte", label: "Inhalte" },
  { href: "/kunde/medien", label: "Medien" },
  { href: "/kunde/anfragen", label: "Anfragen" },
  { href: "/kunde/benutzer", label: "Benutzer & Rollen" },
  { href: "/kunde/funktionen", label: "Funktionen" },
  { href: "/kunde/einstellungen", label: "Einstellungen" },
] as const;

export const contentModules = {
  fuehrerscheinklassen: {
    title: "Führerscheinklassen",
    singular: "Führerscheinklasse",
    example: "Klasse B",
  },
  preise: {
    title: "Preise",
    singular: "Preisposition",
    example: "Grundbetrag Klasse B",
  },
  kurse: { title: "Kurse", singular: "Kurs", example: "Theorie-Intensivkurs" },
  team: { title: "Team", singular: "Teammitglied", example: "Mara Beispiel" },
  fahrzeuge: {
    title: "Fahrzeuge",
    singular: "Fahrzeug",
    example: "Demo Kompakt",
  },
  standorte: {
    title: "Standorte & Öffnungszeiten",
    singular: "Standort",
    example: "Morgenrot Lernstudio",
  },
} as const;
