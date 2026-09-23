import { CustomerPage } from "@/components/customer/customer-page";
import { OnboardingLinkForm } from "@/components/setup/onboarding-link-form";
import Link from "next/link";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findSalesLeadForInstance } from "@/modules/platform/sales-crm";
import { listPlatformPlans } from "@/modules/platform/plans";

export default async function NewTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  await requirePlatformPermission("platform.tenants.manage");
  const { lead: leadId } = await searchParams;
  const lead = leadId
    ? await findSalesLeadForInstance(leadId).catch(() => null)
    : null;
  const plans = (await listPlatformPlans()).filter((plan) => plan.active);
  return (
    <CustomerPage
      title="Instanz erstellen"
      description="Kundendaten vortragen und einen sicheren Einrichtungslink bereitstellen."
    >
      {leadId && !lead ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900">
          Der ausgewählte Akquise-Lead wurde nicht gefunden. Öffne die
          Instanzerstellung erneut aus dem Akquise-Bereich.
        </div>
      ) : lead?.convertedTenantId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">
            Dieser Lead ist bereits mit einer Kundeninstanz verbunden.
          </p>
          <Link
            className="mt-3 inline-flex font-semibold underline"
            href={`/admin/mandanten/${lead.convertedTenantId}`}
          >
            Kundenakte öffnen →
          </Link>
        </div>
      ) : (
        <OnboardingLinkForm
          plans={plans.map((plan) => ({
            id: plan.id,
            name: plan.publicName,
            monthlyPriceCents: plan.monthlyPriceCents ?? 0,
            setupPriceCents: plan.setupPriceCents ?? 0,
            annualBillingEnabled: plan.annualBillingEnabled,
            annualDiscountBasisPoints: plan.annualDiscountBasisPoints,
            minimumTermMonths: plan.minimumTermMonths,
          }))}
          initialValues={
            lead
              ? {
                  companyName: lead.companyName,
                  ownerName: lead.contactName ?? "",
                  ownerEmail: lead.email ?? "",
                  phone: lead.phone ?? "",
                  domain: lead.website
                    ? lead.website
                        .replace(/^https?:\/\//i, "")
                        .replace(/\/$/, "")
                    : "",
                }
              : undefined
          }
          leadId={lead?.id}
        />
      )}
    </CustomerPage>
  );
}
