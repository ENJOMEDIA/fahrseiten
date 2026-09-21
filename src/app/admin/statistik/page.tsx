import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { getTrafficOverview } from "@/modules/analytics/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

export default async function StatisticsPage() {
  await requirePlatformPermission("platform.security.manage");
  const data = await getTrafficOverview(30);
  const total = data.daily.reduce((sum, item) => sum + Number(item.views), 0);
  const peak = Math.max(1, ...data.daily.map((item) => Number(item.views)));
  return (
    <CustomerPage
      title="Statistik"
      description="Einwilligungsbasierte, stündlich aggregierte Seitenaufrufe der Plattform und Mandanten der letzten 30 Tage. Es werden keine IP-Adressen oder Besucherprofile gespeichert."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Aufrufe</p>
          <p className="mt-2 text-4xl font-semibold">{total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Erfasste Websites</p>
          <p className="mt-2 text-4xl font-semibold">{data.byTenant.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Zeitraum</p>
          <p className="mt-2 text-lg font-semibold">30 Tage</p>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Verlauf</h2>
        <div className="mt-6 flex h-48 items-end gap-1">
          {data.daily.map((item) => (
            <div
              className="group relative min-w-2 flex-1 rounded-t bg-cyan-500"
              key={item.day}
              style={{
                height: `${Math.max(4, (Number(item.views) / peak) * 100)}%`,
              }}
              title={`${item.day}: ${item.views} Aufrufe`}
            />
          ))}
        </div>
      </Card>
      <Card className="mt-6 overflow-x-auto">
        <h2 className="text-xl font-semibold">Websites und Mandanten</h2>
        <table className="mobile-stack-table mt-5 w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-3">Mandant</th>
              <th>Domain</th>
              <th className="text-right">Aufrufe</th>
            </tr>
          </thead>
          <tbody>
            {data.byTenant.map((item) => (
              <tr
                className="border-b border-slate-100"
                key={`${item.tenantId}-${item.hostname}`}
              >
                <td className="py-3 font-semibold" data-label="Mandant">
                  {item.tenantName ??
                    (item.tenantId ? "Mandant" : "FahrSeiten")}
                </td>
                <td data-label="Domain">{item.hostname}</td>
                <td className="text-right font-semibold" data-label="Aufrufe">
                  {Number(item.views)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </CustomerPage>
  );
}
