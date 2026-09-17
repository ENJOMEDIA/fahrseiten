export const featureCatalog = {
  managed_website: {
    title: "Öffentliche Fahrschulwebsite",
    description: "Moderner Webauftritt auf der eigenen Kundendomain.",
    availability: "available",
  },
  website_builder: {
    title: "Website-Builder",
    description: "Seiten und kontrollierte Blöcke bearbeiten.",
    availability: "planned",
  },
  content_modules: {
    title: "Fahrschul-Inhalte",
    description: "Klassen, Preise, Kurse, Team, Fahrzeuge, Standorte und FAQ.",
    availability: "available",
  },
  contact_management: {
    title: "Anfragen & Kontakte",
    description:
      "Kontaktformular und einfache Bearbeitung eingehender Anfragen.",
    availability: "planned",
  },
  custom_domain: {
    title: "Eigene Domain",
    description: "DNS-Begleitung, SSL-Status und Betrieb auf der Kundendomain.",
    availability: "available",
  },
  legal_consent: {
    title: "Recht & Consent",
    description: "Geführte Rechtstexte und technische Consent-Steuerung.",
    availability: "available",
  },
  maintenance_preview: {
    title: "Wartungs- & Vorschauseite",
    description: "Gebrandete Vorschauseite bis zur öffentlichen Freigabe.",
    availability: "available",
  },
  media_branding: {
    title: "Logo, Favicon & Medien",
    description: "Eigener Markenauftritt mit sicher verwalteten Bilddateien.",
    availability: "available",
  },
  multi_location: {
    title: "Mehrere Standorte",
    description: "Zusätzliche Fahrschulstandorte strukturiert verwalten.",
    availability: "available",
  },
  priority_support: {
    title: "Priorisierter Support",
    description: "Anliegen werden im Betrieb bevorzugt bearbeitet.",
    availability: "available",
  },
  lesson_reminders: {
    title: "Fahrstundenerinnerungen",
    description: "Automatische Erinnerungen an Termine.",
    availability: "planned",
  },
  lesson_booking: {
    title: "Terminbuchung",
    description: "Fahrstunden online planen und buchen.",
    availability: "planned",
  },
  advanced_crm: {
    title: "Erweitertes CRM",
    description: "Zusätzliche Kunden- und Vertriebsabläufe.",
    availability: "planned",
  },
  sms: {
    title: "SMS",
    description: "Benachrichtigungen per SMS.",
    availability: "planned",
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Benachrichtigungen über WhatsApp.",
    availability: "planned",
  },
  payments: {
    title: "Online-Zahlungen",
    description: "Zahlungen sicher online abwickeln.",
    availability: "planned",
  },
  analytics: {
    title: "Statistiken",
    description: "Erweiterte Auswertungen und Berichte.",
    availability: "planned",
  },
  ad_campaigns: {
    title: "Anzeigenkampagnen",
    description:
      "Werbekampagnen aus dem Kundenbereich vorbereiten und kontrolliert schalten.",
    availability: "planned",
  },
} as const satisfies Record<
  string,
  { title: string; description: string; availability: "available" | "planned" }
>;
export type FeatureKey = keyof typeof featureCatalog;
export type FeatureStatus = "unavailable" | "coming_soon" | "beta" | "enabled";
