import { CustomerPage } from "@/components/customer/customer-page";
import { LegalBuilder } from "@/modules/legal/legal-builder";
import { LegalEditor } from "@/modules/legal/legal-editor";
import { createPlatformTerms } from "@/modules/legal/documents";
import {
  findLatestPlatformLegalDocuments,
  findPlatformLegalProfile,
} from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

import {
  replacePlatformTermsTemplateAction,
  savePlatformLegalAction,
  savePlatformTermsAction,
} from "./actions";

export default async function PlatformLegalPage() {
  await requirePlatformPermission("platform.security.manage");
  const [documents, profile] = await Promise.all([
    findLatestPlatformLegalDocuments(),
    findPlatformLegalProfile(),
  ]);
  const latest = (type: "imprint" | "privacy" | "terms") =>
    documents.find((document) => document.documentType === type);
  const termsNeedRefresh = !latest("terms")?.content.includes(
    "Zahlungsintervall und Laufzeit sind voneinander unabhängig",
  );
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
              "analytics",
            ]}
          />
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
            <h2 className="text-lg font-semibold text-cyan-950">
              Aktuelle B2B-AGB-Vorlage
            </h2>
            <p className="mt-2 text-sm leading-6 text-cyan-950/75">
              Ersetzt den vorhandenen AGB-Entwurf durch die aktuelle Vorlage mit
              Inhaltsverantwortung, Abrechnung, Sperrung, Datenschutz und
              abgestufter Haftung. Eigene Änderungen im aktuellen Entwurf werden
              dabei überschrieben; eine Veröffentlichung erfolgt nicht.
            </p>
            {termsNeedRefresh ? (
              <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                Die gespeicherte Fassung enthält die aktuelle Regel zu
                Mindestlaufzeit, Jahreszahlung, unbefristeter Verlängerung und
                einmonatiger Kündigungsfrist noch nicht. Vorlage einsetzen,
                fachlich prüfen und anschließend bewusst veröffentlichen.
              </p>
            ) : null}
            <form action={replacePlatformTermsTemplateAction} className="mt-4">
              <button className="rounded-xl bg-cyan-900 px-4 py-3 text-sm font-semibold text-white">
                Aktuelle Vorlage als Entwurf einsetzen
              </button>
            </form>
          </div>
          <LegalEditor
            action={savePlatformTermsAction}
            content={
              latest("terms")?.content ?? createPlatformTerms(profile.data)
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
