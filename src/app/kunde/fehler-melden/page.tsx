import { CustomerPage } from "@/components/customer/customer-page";
import { ErrorReportForm } from "@/modules/support/error-report-form";

export default function CustomerErrorReportPage() {
  return (
    <CustomerPage
      title="Fehler melden"
      description="Melde einen technischen Fehler mit Referenz-ID und ohne sensible Inhalte."
    >
      <ErrorReportForm surface="customer_backend" />
    </CustomerPage>
  );
}
