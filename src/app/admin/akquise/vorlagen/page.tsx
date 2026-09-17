import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listSalesEmailTemplates } from "@/modules/platform/sales-email";
import { SalesTemplateForm } from "../sales-forms";
import { SalesNav } from "../sales-nav";

export default async function SalesTemplatesPage() {
  await requirePlatformPermission("platform.sales.manage");
  const templates = await listSalesEmailTemplates();
  return (
    <CustomerPage
      title="Akquise-Vorlagen"
      description="Personalisierte Textvorlagen pflegen. FahrSeiten erzeugt daraus eine sichere, responsive HTML-E-Mail."
    >
      <SalesNav />
      <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <section className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <p className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
                {template.active ? "Aktiv" : "Inaktiv"}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{template.name}</h2>
              <p className="mt-2 text-sm font-semibold">
                {template.subjectTemplate}
              </p>
              <pre className="mt-4 font-sans text-sm leading-6 whitespace-pre-wrap text-slate-600">
                {template.bodyTemplate}
              </pre>
            </Card>
          ))}
        </section>
        <SalesTemplateForm />
      </div>
    </CustomerPage>
  );
}
