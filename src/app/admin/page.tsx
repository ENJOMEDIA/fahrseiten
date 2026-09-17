import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
export default async function PlatformDashboardPage() {
  const identity = await getSessionIdentity();
  const role = identity?.platformRole ?? null;
  return (
    <>
      <Breadcrumbs items={[{ label: "Plattform" }, { label: "Übersicht" }]} />
      <h1 className="mt-6 text-3xl font-semibold">Plattform-Admin</h1>
      <p className="mt-3 text-slate-600">
        Zentrale Verwaltung mit rollenabhängigen Bereichen und vollständiger
        Audit-Grundlage.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {hasPlatformPermission(role, "platform.tenants.manage") ? (
          <Card>
            <h2 className="font-semibold">Mandanten</h2>
            <p className="mt-2 text-sm text-slate-600">
              Kunden, Domains, Pläne, Features und Onboarding.
            </p>
            <Link
              className="mt-4 inline-block font-semibold text-cyan-800"
              href="/admin/mandanten"
            >
              Öffnen
            </Link>
          </Card>
        ) : null}
        {hasPlatformPermission(role, "platform.sales.manage") ? (
          <Card>
            <h2 className="font-semibold">Akquise</h2>
            <p className="mt-2 text-sm text-slate-600">
              Leads, Aktivitäten und Wiedervorlagen.
            </p>
            <Link
              className="mt-4 inline-block font-semibold text-cyan-800"
              href="/admin/akquise"
            >
              Öffnen
            </Link>
          </Card>
        ) : null}
        {hasPlatformPermission(role, "platform.support.diagnose") ? (
          <Card>
            <h2 className="font-semibold">Support</h2>
            <p className="mt-2 text-sm text-slate-600">
              Protokollierte Diagnose ohne Kontoübernahme.
            </p>
            <Link
              className="mt-4 inline-block font-semibold text-cyan-800"
              href="/admin/support"
            >
              Öffnen
            </Link>
          </Card>
        ) : null}
      </div>
    </>
  );
}
