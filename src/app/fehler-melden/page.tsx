import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { ErrorReportForm } from "@/modules/support/error-report-form";
export default async function ReportErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ referenceId?: string; summary?: string }>;
}) {
  const query = await searchParams;
  return (
    <SimpleMarketingPage
      eyebrow="Hilfe"
      title="Fehler melden"
      text="Beschreibe einen technischen Fehler ohne Passwörter, Zugangsdaten oder personenbezogene Inhalte."
    >
      <ErrorReportForm
        initialReferenceId={query.referenceId?.slice(0, 40)}
        initialSummary={query.summary?.slice(0, 180)}
        surface="marketing"
      />
    </SimpleMarketingPage>
  );
}
