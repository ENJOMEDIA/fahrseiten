import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionIdentity } from "@/modules/auth/session";
import { customerNavigation } from "@/modules/customer/navigation";
import { findTenantLogoId } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSessionIdentity();
  if (!identity || identity.memberships.length === 0) redirect("/login");
  const logoId = await findTenantLogoId(identity.memberships[0].tenantId);
  return (
    <AppShell
      eyebrow="Kundenverwaltung"
      logoUrl={logoId ? mediaPublicUrl(logoId) : undefined}
      navigation={customerNavigation}
      title={identity.displayName}
    >
      {children}
    </AppShell>
  );
}
