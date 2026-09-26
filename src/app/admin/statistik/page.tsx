import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { analyticsGeoConfiguration } from "@/modules/analytics/geoip";
import { getTrafficOverview } from "@/modules/analytics/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

export default async function StatisticsPage() {
  await requirePlatformPermission("platform.security.manage");
  const data = await getTrafficOverview(30);
  const geo = analyticsGeoConfiguration();
  const total = data.daily.reduce((sum, item) => sum + Number(item.views), 0);
  const peak = Math.max(1, ...data.daily.map((item) => Number(item.views)));
  const located = data.byLocation.reduce(
    (sum, item) => sum + (item.countryCode ? Number(item.views) : 0),
    0,
  );
  const timestampFormatter = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  });
  return (
    <CustomerPage
      title="Statistik"
      description="Einwilligungsbasierte, stündlich aggregierte Seitenaufrufe der Plattform und Mandanten der letzten 30 Tage. IP-Adressen werden nicht gespeichert und es entstehen keine Besucherprofile."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <Card>
          <p className="text-sm text-slate-500">Grob zugeordnet</p>
          <p className="mt-2 text-4xl font-semibold">{located}</p>
          <p className="mt-1 text-xs text-slate-500">Stadt, Region oder Land</p>
        </Card>
      </div>
      <div
        className={`mt-6 rounded-2xl border p-4 text-sm ${geo.configured ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}
      >
        <p className="font-semibold">
          Lokale Standortauswertung:{" "}
          {geo.configured ? "aktiv" : "nicht konfiguriert"}
        </p>
        <p className="mt-1 leading-6">
          {geo.configured
            ? "Die IP-Adresse wird nach Einwilligung ausschließlich lokal einer groben Stadt, Region und einem Land zugeordnet und danach verworfen."
            : "Aufrufe werden weiterhin gezählt, erscheinen beim Standort aber als „Unbekannt“. Für Ortsdaten müssen die lokale GeoIP-Datenbank und der von Plesk gesetzte IP-Header konfiguriert werden."}
        </p>
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
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <h2 className="text-xl font-semibold">Standorte</h2>
          <p className="mt-1 text-sm text-slate-500">
            Grobe, technisch bedingte Näherung; nicht der genaue Aufenthaltsort.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="mobile-stack-table w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Stadt</th>
                  <th>Region</th>
                  <th>Land</th>
                  <th className="text-right">Aufrufe</th>
                </tr>
              </thead>
              <tbody>
                {data.byLocation.map((item, index) => (
                  <tr
                    className="border-b border-slate-100"
                    key={`${item.countryCode}-${item.region}-${item.city}-${index}`}
                  >
                    <td className="py-3 font-semibold" data-label="Stadt">
                      {item.city ?? "Unbekannt"}
                    </td>
                    <td data-label="Region">{item.region ?? "–"}</td>
                    <td data-label="Land">
                      {item.countryName ?? item.countryCode ?? "Unbekannt"}
                    </td>
                    <td
                      className="text-right font-semibold"
                      data-label="Aufrufe"
                    >
                      {Number(item.views)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <h2 className="text-xl font-semibold">Beliebte Seiten</h2>
          <div className="mt-4 space-y-2">
            {data.byPath.map((item) => (
              <div
                className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 text-sm"
                key={`${item.hostname}-${item.path}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.path}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.hostname}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">
                  {Number(item.views)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6 overflow-hidden">
        <h2 className="text-xl font-semibold">Letzte Zugriffszeiten</h2>
        <p className="mt-1 text-sm text-slate-500">
          Stündliche Summen in deutscher Zeit, ohne einzelne Besucherprofile.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="mobile-stack-table w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3">Zeit</th>
                <th>Website</th>
                <th>Seite</th>
                <th>Ort</th>
                <th className="text-right">Aufrufe</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-3 font-semibold" data-label="Zeit">
                    {timestampFormatter.format(item.hour)} Uhr
                  </td>
                  <td data-label="Website">{item.hostname}</td>
                  <td data-label="Seite">{item.path}</td>
                  <td data-label="Ort">
                    {[item.city, item.region, item.countryName]
                      .filter(Boolean)
                      .join(", ") || "Unbekannt"}
                  </td>
                  <td className="text-right font-semibold" data-label="Aufrufe">
                    {item.views}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
