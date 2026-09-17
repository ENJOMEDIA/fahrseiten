import { CustomerPage } from "@/components/customer/customer-page";
import { getSessionIdentity } from "@/modules/auth/session";
import { LegalBuilder } from "@/modules/legal/legal-builder";
import {
  findLatestTenantLegalDocuments,
  findRequiredTenantLegalModules,
  findTenantLegalProfile,
} from "@/modules/legal/repository";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";
import { saveLegalAction } from "./actions";

export default async function LegalPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  const context =
    identity && membership
      ? createMembershipTenantContext({
          requestedTenantId: membership.tenantId,
          userId: identity.id,
          activeTenantIds: identity.memberships.map((item) => item.tenantId),
        })
      : null;
  const [documents, profile, requiredModules] = context
    ? await Promise.all([
        findLatestTenantLegalDocuments(context),
        findTenantLegalProfile(context),
        findRequiredTenantLegalModules(context.tenantId),
      ])
    : [[], null, []];
  const latest = (type: "imprint" | "privacy") =>
    documents.find((document) => document.documentType === type);

  return (
    <CustomerPage
      title="Rechtliches & Consent"
      description="Geführte Angaben pflegen und passende Rechtstexte aus den aktiven Modulen erzeugen."
    >
      {profile ? (
        <LegalBuilder
          action={saveLegalAction}
          imprintStatus={latest("imprint")?.status ?? "draft"}
          privacyStatus={latest("privacy")?.status ?? "draft"}
          profile={profile}
          requiredModules={requiredModules}
        />
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die notwendigen Mandantenstammdaten sind noch nicht vollständig.
        </p>
      )}
    </CustomerPage>
  );
}
