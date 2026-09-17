import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { ErrorReportForm } from "@/modules/support/error-report-form";
export default function ReportErrorPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Hilfe"
      title="Fehler melden"
      text="Beschreibe einen technischen Fehler ohne Passwörter, Zugangsdaten oder personenbezogene Inhalte."
    >
      <ErrorReportForm surface="marketing" />
    </SimpleMarketingPage>
  );
}
