import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listSalesPipeline } from "@/modules/platform/sales-crm";
import { listSalesEmailTemplates } from "@/modules/platform/sales-email";
import { CsvImportForm, OutreachForm } from "../sales-forms";
import { SalesNav } from "../sales-nav";

export default async function SalesContactsPage() {
  await requirePlatformPermission("platform.sales.manage");
  const [leads, templates] = await Promise.all([
    listSalesPipeline(),
    listSalesEmailTemplates(),
  ]);
  return (
    <CustomerPage
      title="Akquise-Kontakte"
      description="Kontakte importieren, auswählen und eine persönliche E-Mail kontrolliert zum Versand einplanen."
    >
      <SalesNav />
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <h2 className="font-semibold text-amber-950">
          E-Mail-Status ohne verstecktes Tracking
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          FahrSeiten zeigt an, ob eine Nachricht auf den Versand wartet, vom
          SMTP-Server angenommen wurde oder fehlgeschlagen ist. Unsichtbare
          Öffnungspixel werden nicht eingesetzt, weil dafür nach der aktuellen
          Position der Datenschutzkonferenz eine vorherige Einwilligung der
          empfangenden Person erforderlich ist. Die SMTP-Annahme beweist keine
          tatsächliche Zustellung oder Öffnung.
        </p>
      </Card>
      <CsvImportForm />
      <div className="mt-8">
        <OutreachForm
          leads={leads}
          templates={templates
            .filter((item) => item.active)
            .map(({ id, name }) => ({ id, name }))}
        />
      </div>
    </CustomerPage>
  );
}
