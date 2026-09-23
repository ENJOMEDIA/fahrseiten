import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listPlatformReferrals } from "@/modules/referrals/service";

import { ReferralActions } from "./referral-actions";

const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });
const money = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const labels = {
  pending: "Lead eingegangen",
  awaiting_eligibility: "Wartefrist / Zahlung offen",
  qualified: "Bonus freigegeben",
  credited: "Verrechnet",
  rejected: "Abgelehnt",
  cancelled: "Storniert",
} as const;

export default async function AdminReferralsPage() {
  await requirePlatformPermission("platform.security.manage");
  const rows = await listPlatformReferrals();
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Plattform", href: "/admin" },
          { label: "Empfehlungen" },
        ]}
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            Kontrollierter Ablauf
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Empfehlungen sicher verrechnen
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            FahrSeiten dokumentiert Anspruch und Historie. Steuerlich
            verbindliche Rechnungen bleiben in Accountable. Eine Verrechnung ist
            hier erst möglich, nachdem du die konkrete Rechnung ausgewählt und
            die tatsächliche Anpassung bestätigt hast.
          </p>
        </Card>
        <Card className="border-amber-300 bg-amber-50">
          <h2 className="font-semibold text-amber-950">
            Vor jeder Verrechnung
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-amber-950">
            <li>Geworbener Kunde ist mindestens 30 Tage aktiv.</li>
            <li>Seine erste Rechnung ist als bezahlt dokumentiert.</li>
            <li>
              Gutschrift in Accountable auf der richtigen Rechnung abziehen.
            </li>
            <li>Rechnungskopie hochladen und erst dann hier zuordnen.</li>
          </ol>
        </Card>
      </div>
      <div className="mt-6 space-y-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusBadge
                    tone={
                      row.status === "credited"
                        ? "success"
                        : row.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {labels[row.status]}
                  </StatusBadge>
                  <h2 className="mt-3 text-xl font-semibold">
                    {row.referrerName} → {row.referredName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Erfasst {date.format(row.createdAt)}
                    {row.eligibleAt
                      ? ` · frühestens ${date.format(row.eligibleAt)}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Fixierter Bonus</p>
                  <strong>
                    {row.rewardCentsSnapshot
                      ? money.format(row.rewardCentsSnapshot / 100)
                      : "Noch offen"}
                  </strong>
                  {row.creditedInvoiceNumber ? (
                    <p className="mt-1 text-xs">
                      Rechnung {row.creditedInvoiceNumber}
                    </p>
                  ) : null}
                </div>
              </div>
              {row.rejectionReason ? (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900">
                  Grund: {row.rejectionReason}
                </p>
              ) : null}
              <ReferralActions
                referralId={row.id}
                status={row.status}
                invoices={row.invoiceOptions}
              />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-slate-500">
              Noch keine Empfehlungen vorhanden.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
