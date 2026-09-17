import Link from "next/link";
import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
export default async function TenantsPage() {
  await requirePlatformPermission("platform.tenants.manage");
  return (
    <CustomerPage
      title="Mandanten"
      description="Kunden suchen, anlegen, deaktivieren und mit Domains, Plan sowie Features einsehen."
    >
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Mandanten suchen"
          className="min-w-72 rounded-xl border bg-white p-3"
          placeholder="Name oder Domain"
        />
        <button className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white">
          Mandant anlegen
        </button>
      </div>
      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Fahrschule Morgenrot (Demo)</h2>
            <p className="text-sm text-slate-600">
              demo.fahrseiten.local · lokaler Demo-Plan
            </p>
          </div>
          <StatusBadge tone="success">Aktiv</StatusBadge>
        </div>
        <Link
          className="mt-4 inline-block font-semibold text-cyan-800"
          href="/admin/mandanten/demo"
        >
          Details & Onboarding
        </Link>
      </Card>
    </CustomerPage>
  );
}
