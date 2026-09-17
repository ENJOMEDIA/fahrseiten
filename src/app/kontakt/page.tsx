import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { ConsultationForm } from "@/modules/sales/consultation-form";
export default function ContactPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Beratung"
      title="Lass uns über deine Fahrschule sprechen."
      text="Die lokale Anfrage landet im Akquise-CRM von FahrSeiten und bei keinem Kundenmandanten."
    >
      <ConsultationForm />
    </SimpleMarketingPage>
  );
}
