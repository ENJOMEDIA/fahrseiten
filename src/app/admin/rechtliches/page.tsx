import { CustomerPage } from "@/components/customer/customer-page";
import { LegalEditor } from "@/modules/legal/legal-editor";
import { findLatestPlatformLegalDocuments } from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

import { savePlatformLegalAction } from "./actions";

export default async function PlatformLegalPage() {
  await requirePlatformPermission("platform.security.manage");
  const documents = await findLatestPlatformLegalDocuments();
  return (
    <CustomerPage
      title="Rechtliches"
      description="Impressum und Datenschutz der FahrSeiten-Plattform verwalten."
    >
      <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm">
        Die automatisch erzeugten Entwürfe müssen anhand der tatsächlichen
        Anbieter, Prozesse und Verträge rechtlich geprüft werden.
      </p>
      <div className="grid gap-6">
        {(["imprint", "privacy"] as const).map((type) => {
          const document = documents.find((item) => item.documentType === type);
          return document ? (
            <LegalEditor
              action={savePlatformLegalAction}
              content={document.content}
              key={type}
              status={document.status}
              type={type}
            />
          ) : (
            <p key={type}>Entwurf fehlt.</p>
          );
        })}
      </div>
    </CustomerPage>
  );
}
