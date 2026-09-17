import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge as Badge } from "@/components/ui/card";
export default function DomainPage() {
  return (
    <CustomerPage
      title="Domainstatus"
      description="Domainverifikation und SSL-Status werden getrennt und ohne automatische DNS-Änderungen angezeigt."
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">demo.fahrseiten.local</h2>
            <p className="mt-1 text-sm text-slate-600">
              Lokale Testdomain · keine öffentliche DNS-Zone
            </p>
          </div>
          <Badge tone="success">Lokal aktiv</Badge>
        </div>
        <dl className="mt-5 grid grid-cols-[10rem_1fr] gap-2 text-sm">
          <dt>Verifikation</dt>
          <dd>Lokaler Seed</dd>
          <dt>SSL</dt>
          <dd>Nicht extern geprüft</dd>
          <dt>Primärdomain</dt>
          <dd>Ja, nur lokal</dd>
        </dl>
      </Card>
    </CustomerPage>
  );
}
