import { CustomerPage } from "@/components/customer/customer-page";
import { getSessionIdentity } from "@/modules/auth/session";
import { LegalEditor } from "@/modules/legal/legal-editor";
import { findLatestTenantLegalDocuments } from "@/modules/legal/repository";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";
import { saveLegalAction } from "./actions";

export default async function LegalPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  const documents =
    identity && membership
      ? await findLatestTenantLegalDocuments(
          createMembershipTenantContext({
            requestedTenantId: membership.tenantId,
            userId: identity.id,
            activeTenantIds: identity.memberships.map((item) => item.tenantId),
          }),
        )
      : [];
  const latest = (type: "imprint" | "privacy") =>
    documents.find((document) => document.documentType === type);

  return (
    <CustomerPage
      title="Rechtliches & Consent"
      description="Vorbereitete Pflichttexte prüfen, vervollständigen und kontrolliert veröffentlichen."
    >
      <p className="mb-6 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6">
        Die beim Onboarding erzeugten Texte sind technische Entwürfe. Prüfe sie
        anhand der tatsächlichen Rechtsform, Dienste, Verträge und Fristen und
        hole bei Bedarf rechtlichen Rat ein.
      </p>
      <div className="grid gap-6">
        {(["imprint", "privacy"] as const).map((type) => {
          const document = latest(type);
          return document ? (
            <LegalEditor
              content={document.content}
              action={saveLegalAction}
              key={type}
              status={document.status}
              type={type}
            />
          ) : (
            <p
              className="rounded-2xl border border-amber-300 bg-amber-50 p-5"
              key={type}
            >
              Für {type === "imprint" ? "das Impressum" : "den Datenschutz"}
              fehlt ein Entwurf.
            </p>
          );
        })}
      </div>
    </CustomerPage>
  );
}
