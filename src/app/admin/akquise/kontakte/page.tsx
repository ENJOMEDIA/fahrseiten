import { CustomerPage } from "@/components/customer/customer-page";
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
