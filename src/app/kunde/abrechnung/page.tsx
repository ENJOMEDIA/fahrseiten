import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card, StatusBadge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantBilling } from "@/modules/billing/service";
import { listTenantContractDocuments } from "@/modules/contracts/service";

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
const contractStatusLabels = {
  prepared: "Wird vorbereitet",
  sent: "Zur Unterschrift bereit",
  signed: "Unterzeichnet",
  declined: "Abgelehnt",
  expired: "Abgelaufen",
  cancelled: "Storniert",
} as const;

export default async function CustomerBillingPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  const [billing, contracts] = await Promise.all([
    findTenantBilling(membership.tenantId),
    listTenantContractDocuments(membership.tenantId),
  ]);
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Vertrag & Rechnungen" },
        ]}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="!border-slate-800 !bg-slate-950 !text-slate-50">
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-300 uppercase">
            Vertragsübersicht
          </p>
          <h1 className="mt-3 text-3xl font-semibold break-words text-white">
            {billing.subscription?.planNameSnapshot ??
              "Noch kein Paket zugeordnet"}
          </h1>
          {billing.subscription ? (
            <dl className="mt-7 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Paketpreis pro Monat</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {billing.subscription.monthlyPriceCentsSnapshot === null
                    ? "Laut Angebot"
                    : money.format(
                        billing.subscription.monthlyPriceCentsSnapshot / 100,
                      )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Mindestlaufzeit</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {billing.subscription.minimumTermMonths} Monat(e)
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Kündigung</dt>
                <dd className="mt-1 font-semibold text-white">
                  {billing.subscription.cancellationNoticeMonthsSnapshot} Monat
                  zum Laufzeitende
                </dd>
                <p className="mt-1 text-xs text-slate-400">
                  Danach unbefristet mit einem Monat Frist zum Monatsende.
                </p>
              </div>
              <div>
                <dt className="text-slate-400">Abrechnungsrhythmus</dt>
                <dd className="mt-1 font-semibold text-white">
                  {billing.subscription.billingIntervalMonths === 12
                    ? "Jährlich im Voraus"
                    : "Monatlich"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Betrag je Rechnung</dt>
                <dd className="mt-1 font-semibold text-white">
                  {billing.subscription.billingAmountCentsSnapshot === null
                    ? "Laut Angebot"
                    : money.format(
                        billing.subscription.billingAmountCentsSnapshot / 100,
                      )}
                </dd>
                {billing.subscription.discountBasisPointsSnapshot ? (
                  <p className="mt-1 text-xs text-emerald-300">
                    {billing.subscription.discountBasisPointsSnapshot / 100} %
                    Jahresrabatt berücksichtigt
                  </p>
                ) : null}
              </div>
              <div>
                <dt className="text-slate-400">Nächste Rechnung</dt>
                <dd className="mt-1 font-semibold text-white">
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
          {billing.subscription?.billingIntervalMonths === 12 ? (
            <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-xs leading-5 text-cyan-100">
              Die Jahreszahlung ist eine Zahlungsweise und verlängert deine
              Vertragsbindung nicht. Bei einem früheren wirksamen Vertragsende
              werden volle, danach liegende Leistungsmonate über das führende
              Rechnungssystem korrigiert.
            </p>
          ) : null}
        </Card>
        <Card className="text-slate-950">
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
      <Card className="mt-6 overflow-hidden p-0 text-slate-950">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-semibold">Verträge</h2>
          <p className="mt-2 text-sm text-slate-500">
            Vertragsstände, elektronische Unterschrift und Prüfprotokolle an
            einem Ort.
          </p>
        </div>
        <div className="space-y-3 p-6">
          {contracts.length ? (
            contracts.map((contract) => (
              <div
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={contract.id}
              >
                <div>
                  <p className="font-semibold">{contract.contractNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Erstellt am {date.format(contract.createdAt)} ·{" "}
                    {contractStatusLabels[contract.status]}
                  </p>
                </div>
                <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
                  {contract.signatureRequest?.signingUrl &&
                  ["pending", "opened"].includes(
                    contract.signatureRequest.status,
                  ) ? (
                    <a
                      className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white"
                      href={contract.signatureRequest.signingUrl}
                    >
                      Jetzt unterschreiben
                    </a>
                  ) : null}
                  <a
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                    href={`/api/vertraege/${contract.id}`}
                  >
                    Vertrag laden
                  </a>
                  {contract.signedStorageKey ? (
                    <a
                      className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800"
                      href={`/api/vertraege/${contract.id}?datei=signiert`}
                    >
                      Signierte Fassung
                    </a>
                  ) : null}
                  {contract.evidenceStorageKey ? (
                    <a
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                      href={`/api/vertraege/${contract.id}?datei=nachweis`}
                    >
                      Prüfprotokoll
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Noch kein Vertragsdokument hinterlegt.
            </p>
          )}
        </div>
      </Card>
      <Card className="mt-6 overflow-hidden p-0 text-slate-950">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-semibold">Rechnungshistorie</h2>
          <p className="mt-2 text-sm text-slate-500">
            Hinterlegte Rechnungskopien und Zahlungsstatus.
          </p>
        </div>
        {billing.invoices.length ? (
          <div className="overflow-x-auto">
            <table className="mobile-stack-table w-full min-w-[42rem] text-left text-sm">
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
                    <td className="p-4 font-semibold" data-label="Rechnung">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="p-4" data-label="Datum">
                      {date.format(invoice.issuedAt)}
                    </td>
                    <td className="p-4" data-label="Fällig">
                      {date.format(invoice.dueAt)}
                    </td>
                    <td className="p-4" data-label="Betrag">
                      {money.format(invoice.grossAmountCents / 100)}
                    </td>
                    <td className="p-4" data-label="Status">
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
                    <td className="p-4" data-label="Dokument">
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
