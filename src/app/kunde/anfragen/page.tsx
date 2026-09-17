import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge as Badge } from "@/components/ui/card";
export default function InquiriesPage() {
  return (
    <CustomerPage
      title="Anfragen & Kontakte"
      description="Kontaktanfragen des aktuellen Mandanten werden hier ohne tenantübergreifende Kennzahlen verwaltet."
    >
      <Card>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Posteingang</h2>
          <Badge>Keine Testanfragen</Badge>
        </div>
        <p className="mt-4 text-slate-600">
          Das öffentliche Formular und Statusabläufe werden in Phase 12 ergänzt.
          Es werden keine Beispiel-Personendaten erfunden.
        </p>
      </Card>
    </CustomerPage>
  );
}
