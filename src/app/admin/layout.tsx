import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSessionIdentity();
  if (!identity?.platformRole) redirect("/login");
  const settings = await findPlatformSettings();
  const navigation = [
    {
      href: "/admin",
      label: "Übersicht",
      icon: "⌂",
      description: "Das Wichtigste auf einen Blick",
      group: "Start",
    },
    ...(hasPlatformPermission(identity.platformRole, "platform.tenants.manage")
      ? [
          {
            href: "/admin/mandanten",
            label: "Instanzen & Domains",
            icon: "D",
            description: "Websites, DNS, SSL und Zugänge",
            group: "Plattform",
          },
        ]
      : []),
    ...(hasPlatformPermission(identity.platformRole, "platform.sales.manage")
      ? [
          {
            href: "/admin/kunden",
            label: "Kundenakten",
            icon: "M",
            description: "Historie, Angebote und Kundenstatus",
            group: "Kunden & Vertrieb",
          },
          {
            href: "/admin/akquise",
            label: "Akquise",
            icon: "A",
            description: "Leads und nächste Schritte",
            group: "Kunden & Vertrieb",
          },
          {
            href: "/admin/empfehlungen",
            label: "Empfehlungen",
            icon: "✦",
            description: "Prüfen und Rechnungsgutschriften zuordnen",
            group: "Kunden & Vertrieb",
          },
        ]
      : []),
    ...(hasPlatformPermission(identity.platformRole, "platform.security.manage")
      ? [
          {
            href: "/admin/pakete",
            label: "Pakete & Preise",
            icon: "€",
            description: "Leistungen und Aufpreise",
            group: "Kunden & Vertrieb",
          },
          {
            href: "/admin/rechtliches",
            label: "Rechtliches",
            icon: "§",
            description: "Impressum und Datenschutz",
            group: "Plattform",
          },
          {
            href: "/admin/medien",
            label: "Medien",
            icon: "▧",
            description: "Landingpage-Bilder und Zuschnitte",
            group: "Plattform",
          },
          {
            href: "/admin/statistik",
            label: "Statistik",
            icon: "↗",
            description: "Traffic nach Website und Zeitraum",
            group: "Plattform",
          },
          {
            href: "/admin/einstellungen",
            label: "Einstellungen",
            icon: "⚙",
            description: "Wartungsmodus und Plattform",
            group: "Plattform",
          },
          {
            href: "/admin/system",
            label: "Systemstatus",
            icon: "↻",
            description: "Schema und Migrationen",
            group: "Betrieb & Hilfe",
          },
        ]
      : []),
    ...(hasPlatformPermission(
      identity.platformRole,
      "platform.support.diagnose",
    )
      ? [
          {
            href: "/admin/support",
            label: "Support",
            icon: "?",
            description: "Fehler und Diagnosen",
            group: "Betrieb & Hilfe",
          },
        ]
      : []),
  ];
  return (
    <AppShell
      eyebrow="Plattformverwaltung"
      logoUrl={
        settings?.logoMediaId ? mediaPublicUrl(settings.logoMediaId) : undefined
      }
      navigation={navigation}
      title={identity.displayName}
    >
      {children}
    </AppShell>
  );
}
