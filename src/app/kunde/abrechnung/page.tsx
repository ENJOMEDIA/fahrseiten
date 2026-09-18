import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card, StatusBadge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantBilling } from "@/modules/billing/service";

const money = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });
const statusLabels = {
  open: "Offen",
  paid: "Bezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
} as const;

export default async function CustomerBillingPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  const billing = await findTenantBilling(membership.tenantId);
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Vertrag & Rechnungen" },
        ]}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="bg-slate-950 text-white">
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-300 uppercase">
            Vertragsübersicht
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {billing.subscription?.planNameSnapshot ??
              "Noch kein Paket zugeordnet"}
          </h1>
          {billing.subscription ? (
            <dl className="mt-7 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Monatlicher Preis</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {billing.subscription.monthlyPriceCentsSnapshot === null
                    ? "Laut Angebot"
                    : money.format(
                        billing.subscription.monthlyPriceCentsSnapshot / 100,
                      )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Mindestlaufzeit</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {billing.subscription.minimumTermMonths} Monat(e)
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Abrechnungsrhythmus</dt>
                <dd className="mt-1 font-semibold">
                  Alle {billing.subscription.billingIntervalMonths} Monat(e)
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Nächste Rechnung</dt>
                <dd className="mt-1 font-semibold">
                  {billing.subscription.nextInvoiceAt
                    ? date.format(billing.subscription.nextInvoiceAt)
                    : "Noch nicht eingetragen"}
                </dd>
              </div>
            </dl>
          ) : null}
          <p className="mt-7 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-300">
            Die verbindliche Rechnung wird separat über das Rechnungssystem von
            ENJO MEDIA versendet. Diese Seite zeigt deine Vertrags- und
            Zahlungshistorie.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            Rechnungsanschrift
          </p>
          {billing.profile ? (
            <address className="mt-4 text-sm leading-7 text-slate-700 not-italic">
              {billing.profile.companyName}
              <br />
              {billing.profile.recipientName ? (
                <>
                  {billing.profile.recipientName}
                  <br />
                </>
              ) : null}
              {billing.profile.street}
              <br />
              {billing.profile.postalCode} {billing.profile.city}
              <br />
              {billing.profile.country}
              <br />
              <span className="text-slate-500">{billing.profile.email}</span>
            </address>
          ) : (
            <p className="mt-4 text-sm text-amber-800">
              Noch keine Rechnungsanschrift hinterlegt.
            </p>
          )}
        </Card>
      </div>
      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-semibold">Rechnungshistorie</h2>
          <p className="mt-2 text-sm text-slate-500">
            Hinterlegte Rechnungskopien und Zahlungsstatus.
          </p>
        </div>
        {billing.invoices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Rechnung</th>
                  <th className="p-4">Datum</th>
                  <th className="p-4">Fällig</th>
                  <th className="p-4">Betrag</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((invoice) => (
                  <tr className="border-t border-slate-100" key={invoice.id}>
                    <td className="p-4 font-semibold">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="p-4">{date.format(invoice.issuedAt)}</td>
                    <td className="p-4">{date.format(invoice.dueAt)}</td>
                    <td className="p-4">
                      {money.format(invoice.grossAmountCents / 100)}
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        tone={
                          invoice.status === "paid"
                            ? "success"
                            : invoice.status === "overdue"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {statusLabels[invoice.status]}
                      </StatusBadge>
                    </td>
                    <td className="p-4">
                      <a
                        className="font-semibold text-cyan-800"
                        href={`/api/rechnungen/${invoice.id}`}
                      >
                        PDF laden
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-slate-500">
            Noch keine Rechnungskopie hinterlegt.
          </p>
        )}
      </Card>
    </>
  );
}
