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
  "Kontaktanfragen und einfache Kontaktverwaltung",
  "Individuelle Domains technisch vorbereitet",
] as const;
export const plannedMarketingFeatures = [
  "Fahrstundenplanung",
  "Schülerverwaltung",
  "SMS und WhatsApp",
  "Online-Zahlungen",
  "Erweiterte Statistiken",
  "Anzeigenkampagnen aus dem Kundenbereich",
] as const;
