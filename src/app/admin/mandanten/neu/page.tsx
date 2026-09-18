import { CustomerPage } from "@/components/customer/customer-page";
import { OnboardingLinkForm } from "@/components/setup/onboarding-link-form";
import { requirePlatformPermission } from "@/modules/platform/access";

export default async function NewTenantPage() {
  await requirePlatformPermission("platform.tenants.manage");
  return (
    <CustomerPage
      title="Instanz erstellen"
      description="Kundendaten vortragen und einen sicheren Einrichtungslink bereitstellen."
    >
      <OnboardingLinkForm />
    </CustomerPage>
  );
}
