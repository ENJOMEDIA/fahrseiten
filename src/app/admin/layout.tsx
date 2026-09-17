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
    },
    ...(hasPlatformPermission(identity.platformRole, "platform.tenants.manage")
      ? [
          {
            href: "/admin/mandanten",
            label: "Mandanten",
            icon: "M",
            description: "Kunden, Domains und Onboarding",
          },
        ]
      : []),
    ...(hasPlatformPermission(identity.platformRole, "platform.sales.manage")
      ? [
          {
            href: "/admin/akquise",
            label: "Akquise",
            icon: "A",
            description: "Leads und nächste Schritte",
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
          },
          {
            href: "/admin/rechtliches",
            label: "Rechtliches",
            icon: "§",
            description: "Impressum und Datenschutz",
          },
          {
            href: "/admin/system",
            label: "Systemstatus",
            icon: "↻",
            description: "Schema und Migrationen",
          },
          {
            href: "/admin/einstellungen",
            label: "Einstellungen",
            icon: "⚙",
            description: "Wartungsmodus und Plattform",
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
