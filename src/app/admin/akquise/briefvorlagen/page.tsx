import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { listPostalLetterTemplates } from "@/modules/onlinebrief/templates";
import { requirePlatformPermission } from "@/modules/platform/access";

import { SalesNav } from "../sales-nav";
import { LetterTemplateForm } from "./template-form";

export default async function PostalTemplatesPage() {
  await requirePlatformPermission("platform.sales.manage");
  const templates = await listPostalLetterTemplates();
  return (
    <CustomerPage
      title="Briefvorlagen"
      description="Starke postalische Akquise-Texte zentral pflegen und bei der PDF-Erstellung direkt einsetzen."
    >
      <SalesNav />
      <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <section className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
                    {template.id.startsWith("builtin-")
                      ? "FahrSeiten-Preset"
                      : "Eigene Vorlage"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {template.name}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Aktiv
                </span>
              </div>
              <p className="mt-4 text-xs font-bold tracking-[.14em] text-cyan-700 uppercase">
                {template.kickerTemplate}
              </p>
              <p className="mt-4 text-lg font-semibold text-slate-900">
                {template.headlineTemplate}
              </p>
              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-slate-600">
                {template.bodyTemplate}
              </p>
            </Card>
          ))}
        </section>
        <LetterTemplateForm />
      </div>
    </CustomerPage>
  );
}
