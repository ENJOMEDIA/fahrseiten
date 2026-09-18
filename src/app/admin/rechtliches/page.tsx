import { CustomerPage } from "@/components/customer/customer-page";
import { LegalBuilder } from "@/modules/legal/legal-builder";
import { LegalEditor } from "@/modules/legal/legal-editor";
import { createPlatformTermsDraft } from "@/modules/legal/documents";
import {
  findLatestPlatformLegalDocuments,
  findPlatformLegalProfile,
} from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

import { savePlatformLegalAction, savePlatformTermsAction } from "./actions";

export default async function PlatformLegalPage() {
  await requirePlatformPermission("platform.security.manage");
  const [documents, profile] = await Promise.all([
    findLatestPlatformLegalDocuments(),
    findPlatformLegalProfile(),
  ]);
  const latest = (type: "imprint" | "privacy" | "terms") =>
    documents.find((document) => document.documentType === type);
  return (
    <CustomerPage
      title="Rechtliches"
      description="Pflichtangaben strukturiert erfassen und rechtliche Dokumente kontrolliert erzeugen."
    >
      {profile ? (
        <div className="space-y-8">
          <LegalBuilder
            action={savePlatformLegalAction}
            autoSave
            imprintStatus={latest("imprint")?.status ?? "draft"}
            privacyStatus={latest("privacy")?.status ?? "draft"}
            profile={profile}
            requiredModules={[
              "contactForm",
              "emailDelivery",
              "consentManagement",
            ]}
          />
          <LegalEditor
            action={savePlatformTermsAction}
            content={
              latest("terms")?.content ?? createPlatformTermsDraft(profile.data)
            }
            status={latest("terms")?.status ?? "draft"}
            type="terms"
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die Plattformstammdaten fehlen. Führe zuerst den Webinstaller aus.
        </p>
      )}
    </CustomerPage>
  );
}
