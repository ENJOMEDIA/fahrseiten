import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSessionIdentity();
  if (!identity?.platformRole) redirect("/login");
  const navigation = [
    { href: "/admin", label: "Übersicht" },
    ...(hasPlatformPermission(identity.platformRole, "platform.tenants.manage")
      ? [{ href: "/admin/mandanten", label: "Mandanten" }]
      : []),
    ...(hasPlatformPermission(identity.platformRole, "platform.sales.manage")
      ? [{ href: "/admin/akquise", label: "Akquise" }]
      : []),
    ...(hasPlatformPermission(
      identity.platformRole,
      "platform.support.diagnose",
    )
      ? [{ href: "/admin/support", label: "Support" }]
      : []),
    ...(hasPlatformPermission(identity.platformRole, "platform.security.manage")
      ? [
          { href: "/admin/rechtliches", label: "Rechtliches" },
          { href: "/admin/einstellungen", label: "Einstellungen" },
        ]
      : []),
  ];
  return (
    <AppShell
      eyebrow="Plattformverwaltung"
      navigation={navigation}
      title={identity.displayName}
    >
      {children}
    </AppShell>
  );
}
