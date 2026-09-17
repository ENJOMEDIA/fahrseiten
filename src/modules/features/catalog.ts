export const featureCatalog = {
  website_builder: {
    title: "Website-Builder",
    description: "Seiten und kontrollierte Blöcke bearbeiten.",
  },
  lesson_reminders: {
    title: "Fahrstundenerinnerungen",
    description: "Automatische Erinnerungen an Termine.",
  },
  lesson_booking: {
    title: "Terminbuchung",
    description: "Fahrstunden online planen und buchen.",
  },
  advanced_crm: {
    title: "Erweitertes CRM",
    description: "Zusätzliche Kunden- und Vertriebsabläufe.",
  },
  sms: { title: "SMS", description: "Benachrichtigungen per SMS." },
  whatsapp: {
    title: "WhatsApp",
    description: "Benachrichtigungen über WhatsApp.",
  },
  payments: {
    title: "Online-Zahlungen",
    description: "Zahlungen sicher online abwickeln.",
  },
  analytics: {
    title: "Statistiken",
    description: "Erweiterte Auswertungen und Berichte.",
  },
  ad_campaigns: {
    title: "Anzeigenkampagnen",
    description:
      "Werbekampagnen aus dem Kundenbereich vorbereiten und kontrolliert schalten.",
  },
} as const;
export type FeatureKey = keyof typeof featureCatalog;
export type FeatureStatus = "unavailable" | "coming_soon" | "beta" | "enabled";
