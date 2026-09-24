import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionIdentity } from "@/modules/auth/session";
import { customerNavigation } from "@/modules/customer/navigation";
import { findTenantLogoId } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { getTenantFeatureStatusMap } from "@/modules/features/access";
import { isFeatureUsable } from "@/modules/features/service";
import { SetupGuideReminder } from "@/components/onboarding/setup-guide-reminder";
import { findWebsiteSetupState } from "@/modules/onboarding/website-setup";
import { hasTenantPermission } from "@/modules/auth/permissions";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSessionIdentity();
  if (!identity || identity.memberships.length === 0) redirect("/login");
  const tenantId = identity.memberships[0].tenantId;
  const [logoId, featureStatuses, setupState] = await Promise.all([
    findTenantLogoId(tenantId),
    getTenantFeatureStatusMap(tenantId),
    findWebsiteSetupState(tenantId),
  ]);
  const navigation = customerNavigation.map((item) => {
    if (item.planned) return { ...item, badge: "Demnächst" };
    if (item.feature && !isFeatureUsable(featureStatuses[item.feature]))
      return {
        ...item,
        href: `/kunde/funktionen?feature=${item.feature}`,
        badge: "Nicht im Paket",
      };
    return item;
  });
  return (
    <AppShell
      eyebrow="Kundenverwaltung"
      logoUrl={logoId ? mediaPublicUrl(logoId) : undefined}
      navigation={navigation}
      title={identity.displayName}
    >
      {children}
      {setupState.showReminder &&
      hasTenantPermission(
        identity.memberships[0].role,
        "tenant.content.write",
      ) ? (
        <SetupGuideReminder percent={setupState.percent} />
      ) : null}
    </AppShell>
  );
}
