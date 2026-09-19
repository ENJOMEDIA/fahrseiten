export type LegalModuleKey =
  | "contactForm"
  | "emailDelivery"
  | "consentManagement"
  | "maps"
  | "analytics"
  | "marketing"
  | "video"
  | "messaging"
  | "onlineBooking"
  | "payments";

type FeatureDefinition = {
  title: string;
  description: string;
  availability: "available" | "planned";
  /** Datenschutzbausteine, die bei wirksamer Freischaltung benötigt werden. */
  legalModules: readonly LegalModuleKey[];
  /** Eigene Kunden-AGB können für transaktionale Funktionen erforderlich sein. */
  tenantTermsRequired: boolean;
};

export const featureCatalog = {
  managed_website: {
    title: "Öffentliche Fahrschulwebsite",
    description: "Moderner Webauftritt auf der eigenen Kundendomain.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  website_builder: {
    title: "Website-Builder",
    description: "Seiten und kontrollierte Blöcke bearbeiten.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  content_modules: {
    title: "Fahrschul-Inhalte",
    description: "Klassen, Preise, Kurse, Team, Fahrzeuge, Standorte und FAQ.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  contact_management: {
    title: "Anfragen & Kontakte",
    description:
      "Kontaktformular und einfache Bearbeitung eingehender Anfragen.",
    availability: "planned",
    legalModules: ["contactForm", "emailDelivery"],
    tenantTermsRequired: false,
  },
  custom_domain: {
    title: "Eigene Domain",
    description: "DNS-Begleitung, SSL-Status und Betrieb auf der Kundendomain.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  legal_consent: {
    title: "Recht & Consent",
    description: "Geführte Rechtstexte und technische Consent-Steuerung.",
    availability: "available",
    legalModules: ["consentManagement"],
    tenantTermsRequired: false,
  },
  maintenance_preview: {
    title: "Individuelle Wartungsseite",
    description: "Gebrandete Wartungsseite bis zur öffentlichen Freigabe.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  media_branding: {
    title: "Erweiterte Medienverwaltung",
    description:
      "Kategorisierte Medienbibliothek, Bildzuschnitt und optimierte Wiederverwendung im Builder.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  theme_templates: {
    title: "Designvorlagen",
    description: "Drei abgestimmte Website-Themes im Builder auswählen.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  multi_location: {
    title: "Mehrere Standorte",
    description: "Zusätzliche Fahrschulstandorte strukturiert verwalten.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  priority_support: {
    title: "Priorisierter Support",
    description:
      "Meldungen werden im Support-Dashboard hervorgehoben und priorisiert bearbeitet.",
    availability: "available",
    legalModules: [],
    tenantTermsRequired: false,
  },
  team_management: {
    title: "Benutzerverwaltung",
    description:
      "Mitarbeitende einladen und Zugriffe als Owner, Editor oder Betrachter steuern.",
    availability: "planned",
    legalModules: [],
    tenantTermsRequired: false,
  },
  lesson_reminders: {
    title: "Fahrstundenerinnerungen",
    description: "Automatische Erinnerungen an Termine.",
    availability: "planned",
    legalModules: ["emailDelivery"],
    tenantTermsRequired: false,
  },
  lesson_booking: {
    title: "Terminbuchung",
    description: "Fahrstunden online planen und buchen.",
    availability: "planned",
    legalModules: ["onlineBooking", "emailDelivery"],
    tenantTermsRequired: true,
  },
  advanced_crm: {
    title: "Erweitertes CRM",
    description: "Zusätzliche Kunden- und Vertriebsabläufe.",
    availability: "planned",
    legalModules: ["contactForm", "emailDelivery"],
    tenantTermsRequired: false,
  },
  sms: {
    title: "SMS",
    description: "Benachrichtigungen per SMS.",
    availability: "planned",
    legalModules: ["messaging"],
    tenantTermsRequired: false,
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Benachrichtigungen über WhatsApp.",
    availability: "planned",
    legalModules: ["messaging"],
    tenantTermsRequired: false,
  },
  payments: {
    title: "Online-Zahlungen",
    description: "Zahlungen sicher online abwickeln.",
    availability: "planned",
    legalModules: ["payments"],
    tenantTermsRequired: true,
  },
  analytics: {
    title: "Statistiken",
    description: "Erweiterte Auswertungen und Berichte.",
    availability: "planned",
    legalModules: ["analytics"],
    tenantTermsRequired: false,
  },
  ad_campaigns: {
    title: "Anzeigenkampagnen",
    description:
      "Werbekampagnen aus dem Kundenbereich vorbereiten und kontrolliert schalten.",
    availability: "planned",
    legalModules: ["marketing"],
    tenantTermsRequired: false,
  },
} as const satisfies Record<string, FeatureDefinition>;
export type FeatureKey = keyof typeof featureCatalog;
export type FeatureStatus = "unavailable" | "coming_soon" | "beta" | "enabled";
