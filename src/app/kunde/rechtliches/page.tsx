import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge as Badge } from "@/components/ui/card";
import { LegalEditor } from "@/modules/legal/legal-editor";
export default function LegalPage() {
  return (
    <CustomerPage
      title="Rechtliches & Consent"
      description="Mandanteneigene Rechtstexte und technische Einwilligungen werden hier gepflegt."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Impressum</h2>
            <Badge>Prüfung offen</Badge>
          </div>
          <p className="mt-3 text-slate-600">
            Keine produktiven Unternehmens- oder Personendaten hinterlegt.
          </p>
          <button className="mt-5 rounded-xl border px-4 py-2 font-semibold">
            Entwurf bearbeiten
          </button>
        </Card>
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Datenschutz & Consent</h2>
            <Badge>Phase 17</Badge>
          </div>
          <p className="mt-3 text-slate-600">
            Technische Kategorien sind vorbereitet; optionale Dienste bleiben
            bis zur Einwilligung blockiert.
          </p>
          <button className="mt-5 rounded-xl border px-4 py-2 font-semibold">
            Einstellungen öffnen
          </button>
        </Card>
      </div>
      <div className="mt-6">
        <LegalEditor />
      </div>
    </CustomerPage>
  );
}
