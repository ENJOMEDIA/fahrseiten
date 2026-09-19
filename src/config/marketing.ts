export const marketingPlans = [
  {
    key: "website",
    name: "FahrSeiten Website",
    price: null,
    description:
      "Website, strukturierte Inhalte, individuelle Domain und Kunden-Backend.",
    available: true,
  },
  {
    key: "growth",
    name: "FahrSeiten Wachstum",
    price: null,
    description:
      "Geplante Erweiterungen für zusätzliche Vertriebs- und Kommunikationsabläufe.",
    available: false,
  },
] as const;
export const availableMarketingFeatures = [
  "Mandantenfähige Fahrschulwebsite",
  "Kontrollierter Block-Builder",
  "Führerscheinklassen, Preise, Kurse, Team, Fahrzeuge und Standorte",
  "Eigene Domain mit DNS- und SSL-Begleitung",
  "Logo, Favicon und optimierte Seitenbilder",
] as const;
export const plannedMarketingFeatures = [
  "Kontaktanfragen und einfache Kontaktverwaltung",
  "Benutzerverwaltung für Fahrschulteams",
  "Fahrstundenplanung",
  "Schülerverwaltung",
  "SMS und WhatsApp",
  "Online-Zahlungen",
  "Erweiterte Statistiken",
  "Anzeigenkampagnen aus dem Kundenbereich",
] as const;
