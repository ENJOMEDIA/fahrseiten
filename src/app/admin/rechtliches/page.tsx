import { CustomerPage } from "@/components/customer/customer-page";
import { LegalBuilder } from "@/modules/legal/legal-builder";
import {
  findLatestPlatformLegalDocuments,
  findPlatformLegalProfile,
} from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

import { savePlatformLegalAction } from "./actions";

export default async function PlatformLegalPage() {
  await requirePlatformPermission("platform.security.manage");
  const [documents, profile] = await Promise.all([
    findLatestPlatformLegalDocuments(),
    findPlatformLegalProfile(),
  ]);
  const latest = (type: "imprint" | "privacy") =>
    documents.find((document) => document.documentType === type);
  return (
    <CustomerPage
      title="Rechtliches"
      description="Pflichtangaben strukturiert erfassen und rechtliche Dokumente kontrolliert erzeugen."
    >
      {profile ? (
        <LegalBuilder
          action={savePlatformLegalAction}
          imprintStatus={latest("imprint")?.status ?? "draft"}
          privacyStatus={latest("privacy")?.status ?? "draft"}
          profile={profile}
          requiredModules={[
            "contactForm",
            "emailDelivery",
            "consentManagement",
          ]}
        />
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Die Plattformstammdaten fehlen. Führe zuerst den Webinstaller aus.
        </p>
      )}
    </CustomerPage>
  );
}
