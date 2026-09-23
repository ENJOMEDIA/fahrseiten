import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card, StatusBadge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantReferralProgram } from "@/modules/referrals/service";

import { ReferralControls } from "./referral-controls";

const money = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });
const labels = {
  pending: "Interesse übermittelt",
  awaiting_eligibility: "Voraussetzungen werden geprüft",
  qualified: "Bonus verfügbar",
  credited: "Auf Rechnung verrechnet",
  rejected: "Nicht berechtigt",
  cancelled: "Storniert",
} as const;

export default async function CustomerReferralsPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  const program = await findTenantReferralProgram(membership.tenantId);
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Weiterempfehlen" },
        ]}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            FahrSeiten Empfehlungsprogramm
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Empfehlen, wenn es wirklich passt.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Teile deinen persönlichen Link selbst mit einer befreundeten
            Fahrschule. Kommt ein Vertrag zustande, bleibt die Instanz
            mindestens 30 Tage aktiv und ist die erste Rechnung bezahlt,
            erhältst du einen Bonus in Höhe deines aktuellen
            Paket-Monatspreises.
          </p>
          <div className="mt-6">
            <ReferralControls
              active={program.code?.active}
              shareUrl={program.shareUrl}
            />
          </div>
        </Card>
        <Card className="bg-slate-950 text-white">
          <p className="text-sm text-slate-400">Noch nicht verrechnet</p>
          <p className="mt-2 text-4xl font-semibold">
            {money.format(program.availableCreditCents / 100)}
          </p>
          <p className="mt-7 text-sm leading-6 text-slate-300">
            Der Bonus wird nicht ausgezahlt. ENJO MEDIA zieht ihn erst nach
            deiner Freigabe auf einer konkreten Accountable-Rechnung ab.
            Einrichtungs-, Foto-, Zusatz- und Portokosten bleiben unberührt.
          </p>
          <p className="mt-5 text-xs leading-5 text-slate-400">
            Beim Teilen bitte offen erwähnen: „Ich kann bei erfolgreicher
            Empfehlung einen Monatsbonus erhalten.“{" "}
            <a className="underline" href="/empfehlungsbedingungen">
              Bedingungen lesen
            </a>
          </p>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-2xl font-semibold">Status deiner Empfehlungen</h2>
        <div className="mt-5 space-y-3">
          {program.referrals.length ? (
            program.referrals.map((entry) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                key={entry.id}
              >
                <div>
                  <StatusBadge
                    tone={
                      entry.status === "credited"
                        ? "success"
                        : entry.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {labels[entry.status]}
                  </StatusBadge>
                  <p className="mt-2 text-xs text-slate-500">
                    Eingegangen am {date.format(entry.createdAt)}. Zum Schutz
                    der empfohlenen Person werden hier keine Kontaktdaten
                    angezeigt.
                  </p>
                </div>
                {entry.rewardCentsSnapshot ? (
                  <strong>
                    {money.format(entry.rewardCentsSnapshot / 100)}
                  </strong>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Noch keine Empfehlung eingegangen.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
