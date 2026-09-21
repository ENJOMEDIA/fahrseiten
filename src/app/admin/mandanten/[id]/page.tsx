import { notFound } from "next/navigation";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformTenant } from "@/modules/platform/tenant-directory";
import { getDnsTarget } from "@/modules/platform/domain-operations";
import { listPlatformPlans } from "@/modules/platform/plans";
import { findTenantBilling } from "@/modules/billing/service";
import { listTenantContractDocuments } from "@/modules/contracts/service";
import { listSalesOffers } from "@/modules/offers/service";

import { DomainManagement, TenantPlanForm } from "./domain-management";
import {
  BillingProfileForm,
  BillingScheduleForm,
  InvoiceUploadForm,
} from "./billing-management";
import { updateInvoiceStatusAction } from "./actions";
import { TenantDeleteForm } from "./tenant-delete-form";
import { PrepareContractForm, SendContractForm } from "./contract-management";

const formatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });
const timelineFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});
const moneyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const contractStatusLabels = {
  prepared: "Vorbereitet",
  sent: "Versendet",
  signed: "Unterzeichnet",
  declined: "Abgelehnt",
  expired: "Abgelaufen",
  cancelled: "Storniert",
} as const;

const activityLabels: Record<string, string> = {
  note: "Akquise-Notiz",
  csv_import_note: "Lead importiert",
  instance_setup_created: "Instanzeinrichtung vorbereitet",
  instance_setup_cancelled: "Instanzeinrichtung storniert",
  tenant_created: "Kundeninstanz angelegt",
  tenant_deleted: "Kundeninstanz gelöscht",
  postal_response_declined: "Postalische Ansprache abgelehnt",
  postal_response_pending: "Rückmeldung über Brief-Link",
  postal_email_confirmed: "E-Mail-Adresse bestätigt",
};

const auditLabels: Record<string, string> = {
  "tenant.onboarding.completed": "Einrichtung abgeschlossen",
  "tenant.domain.updated": "Kundendomain geändert",
  "tenant.domain.checked": "DNS und SSL geprüft",
  "legal.published": "Rechtstext veröffentlicht",
  "legal.draft.saved": "Rechtstext-Entwurf gespeichert",
  "contract.document.prepared": "Vertragsstand vorbereitet",
  "contract.signature.sent": "Vertrag zur Signatur versendet",
  "contract.signature.opened": "Vertrag zur Signatur geöffnet",
  "contract.signature.signed": "Vertrag unterzeichnet",
  "contract.signature.declined": "Vertragsunterschrift abgelehnt",
};

function Step({
  complete,
  children,
}: {
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className={complete ? "text-emerald-500" : "text-amber-400"}>
        {complete ? "✓" : "○"}
      </span>
      <span>{children}</span>
    </li>
  );
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformPermission("platform.tenants.manage");
  const { id } = await params;
  const tenant = await findPlatformTenant(id);
  if (!tenant) notFound();
  const [dnsTarget, availablePlans, billing, contracts, offers] =
    await Promise.all([
      getDnsTarget().catch(() => ({
        hostname: "fahrseiten.de",
        ipv4: [] as string[],
        ipv6: [] as string[],
      })),
      listPlatformPlans(),
      findTenantBilling(id),
      listTenantContractDocuments(id),
      tenant.originLead
        ? listSalesOffers(tenant.originLead.id)
        : Promise.resolve([]),
    ]);

  const legalComplete =
    tenant.publishedLegal.has("imprint") &&
    tenant.publishedLegal.has("privacy");
  const domainComplete =
    tenant.domainStatus === "active" && tenant.sslStatus === "active";
  const domainIsSubdomain = (tenant.domain?.split(".").length ?? 0) > 2;
  const dnsHost = domainIsSubdomain
    ? (tenant.domain?.split(".")[0] ?? "www")
    : "@";
  const timeline = [
    ...(tenant.originLead
      ? [
          {
            id: `lead-${tenant.originLead.id}`,
            title: "Akquise-Lead angelegt",
            detail: `Quelle: ${tenant.originLead.source ?? "nicht angegeben"}`,
            date: tenant.originLead.createdAt,
            actor: null as string | null,
          },
        ]
      : []),
    ...tenant.leadActivities.map((activity) => ({
      id: `activity-${activity.id}`,
      title:
        activityLabels[activity.activityType] ??
        `Akquise: ${activity.activityType}`,
      detail: activity.note,
      date: activity.createdAt,
      actor: activity.actorName,
    })),
    ...tenant.tenantAudits
      .filter((event) => event.action !== "tenant.plan.assigned")
      .map((event) => ({
        id: `audit-${event.id}`,
        title: auditLabels[event.action] ?? event.action,
        detail: `Systemprotokoll · ${event.entityType}`,
        date: event.createdAt,
        actor: event.actorName,
      })),
    ...tenant.billingHistory.map((entry) => ({
      id: `subscription-${entry.id}`,
      title:
        entry.status === "active"
          ? `Paket „${entry.planName}“ zugewiesen`
          : `Paket „${entry.planName}“ beendet`,
      detail: `${entry.monthlyPriceCents === null ? "Monatspreis offen" : `${moneyFormatter.format(entry.monthlyPriceCents / 100)} monatlich`}${entry.setupPriceCents === null ? "" : ` · ${moneyFormatter.format(entry.setupPriceCents / 100)} Einrichtung`}`,
      date: entry.startsAt,
      actor: null as string | null,
    })),
  ].sort((left, right) => right.date.getTime() - left.date.getTime());

  return (
    <CustomerPage
      title={tenant.name}
      description="Vom einmaligen Einrichtungslink bis zur Freigabe der Website."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="bg-slate-950 text-white">
          <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
            Einrichtungsfortschritt
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Der Kundenbereich wurde angelegt.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <Step complete>Mandant und geschützter Kundenbereich angelegt</Step>
            <Step complete={Boolean(tenant.ownerActive)}>
              Inhaberzugang{" "}
              {tenant.ownerEmail ? `für ${tenant.ownerEmail}` : "angelegt"}
            </Step>
            <Step complete={legalComplete}>
              Impressum und Datenschutz geprüft und veröffentlicht
            </Step>
            <Step complete={domainComplete}>
              Domain und SSL technisch freigegeben
            </Step>
            <Step complete={!tenant.maintenanceMode}>
              Öffentliche Website freigeschaltet
            </Step>
          </ul>
          <p className="mt-6 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-400">
            Der Einmallink richtet den Mandanten vollständig ein und wird danach
            ungültig. Der Kunde meldet sich anschließend über /login mit der im
            Formular festgelegten E-Mail und dem Passwort an.
          </p>
        </Card>
        <div className="grid gap-5">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Primäre Domain</p>
                <h2 className="mt-1 text-lg font-semibold">
                  {tenant.domain ?? "Noch nicht hinterlegt"}
                </h2>
              </div>
              <StatusBadge tone={domainComplete ? "success" : "warning"}>
                {tenant.domainStatus ?? "Offen"}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              SSL: {tenant.sslStatus ?? "unbekannt"}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Kundenkonto</p>
            <h2 className="mt-1 text-lg font-semibold">
              {tenant.ownerName ?? "Inhaber"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {tenant.ownerEmail ?? "Keine E-Mail gefunden"} · tenant_owner
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Öffentlicher Zustand</p>
            <div className="mt-2">
              <StatusBadge
                tone={tenant.maintenanceMode ? "warning" : "success"}
              >
                {tenant.maintenanceMode
                  ? "Wartungsseite aktiv"
                  : "Website öffentlich"}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {tenant.maintenanceMessage}
            </p>
          </Card>
        </div>
      </div>
      <section className="mt-7 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className="grid gap-5">
          <Card className="border-cyan-100 bg-gradient-to-br from-cyan-50 to-white">
            <p className="text-xs font-semibold tracking-[.16em] text-cyan-800 uppercase">
              Kundenakte
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {tenant.customerNumber}
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Ursprüngliche Lead-ID</dt>
                <dd className="mt-1 font-mono text-xs break-all">
                  {tenant.originLead?.id ?? "Keine Altzuordnung vorhanden"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Instanz-ID</dt>
                <dd className="mt-1 font-mono text-xs break-all">
                  {tenant.id}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Akquise-Status</dt>
                <dd className="mt-1 font-semibold">
                  {tenant.originLead?.status ?? "Historischer Bestand"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Brief-Rückmeldung</dt>
                <dd className="mt-1 font-semibold">
                  {tenant.originLead?.postalResponse ?? "Keine Rückmeldung"}
                </dd>
              </div>
            </dl>
          </Card>
          <Card>
            <p className="text-xs font-semibold tracking-[.16em] text-slate-500 uppercase">
              Abrechnungsbezug
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {tenant.planName ?? "Noch kein Paket"}
            </h2>
            {tenant.subscriptionId ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Monatlich</dt>
                  <dd className="font-semibold">
                    {tenant.monthlyPriceCents === null
                      ? "Offen"
                      : moneyFormatter.format(tenant.monthlyPriceCents / 100)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Einrichtung</dt>
                  <dd className="font-semibold">
                    {tenant.setupPriceCents === null
                      ? "Offen"
                      : moneyFormatter.format(tenant.setupPriceCents / 100)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Vertragszuordnung</dt>
                  <dd className="mt-1 font-mono text-xs break-all">
                    {tenant.subscriptionId}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Sobald ein Paket zugewiesen wird, werden Bezeichnung und Preise
                als historischer Stand gespeichert.
              </p>
            )}
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              Künftige Rechnungsdokumente werden über die Kundennummer und die
              Vertragszuordnung referenziert. Eine automatische
              Rechnungserstellung ist noch nicht aktiv.
            </p>
          </Card>
        </div>
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Verlauf
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Akquise bis Kundenbetrieb
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {timeline.length} Ereignisse
            </span>
          </div>
          <ol className="mt-6 space-y-5">
            {timeline.map((event) => (
              <li
                className="relative grid grid-cols-[auto_1fr] gap-4"
                key={event.id}
              >
                <span className="mt-1 size-3 rounded-full bg-cyan-500 ring-4 ring-cyan-50" />
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold">{event.title}</p>
                    <time className="text-xs text-slate-500">
                      {timelineFormatter.format(event.date)}
                    </time>
                  </div>
                  {event.detail ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {event.detail}
                    </p>
                  ) : null}
                  {event.actor ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Bearbeitet von {event.actor}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>
      <Card className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
              Vertrieb
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Angebote aus der Kundenakte
            </h2>
          </div>
          {tenant.originLead ? (
            <a
              className="rounded-xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-950"
              href={`/admin/akquise/${tenant.originLead.id}`}
            >
              Kundenakte öffnen →
            </a>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {offers.length ? (
            offers.map((offer) => (
              <article
                className="rounded-2xl border border-slate-200 p-4"
                key={offer.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{offer.offerNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {offer.title} ·{" "}
                      {moneyFormatter.format(offer.netTotalCents / 100)} netto
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      offer.status === "accepted"
                        ? "success"
                        : offer.status === "declined" ||
                            offer.status === "expired"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {offer.status}
                  </StatusBadge>
                </div>
                <a
                  className="mt-3 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                  href={`/api/admin/akquise/angebote/${offer.id}`}
                >
                  Angebots-PDF öffnen
                </a>
              </article>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 lg:col-span-2">
              Für diese Kundenakte ist noch kein Angebot dokumentiert.
            </p>
          )}
        </div>
      </Card>
      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            Vertrag & Abrechnung
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Laufzeit und Fälligkeit
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Accountable bleibt die Rechnungsquelle. Hier werden nur der
            operative Vertragsstand und der nächste erwartete Rechnungstermin
            gepflegt.
          </p>
          {billing.subscription ? (
            <>
              <BillingScheduleForm
                subscription={billing.subscription}
                tenantId={tenant.id}
              />
              <a
                className="mt-5 inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                href={`/api/admin/mandanten/${tenant.id}/vertrag`}
              >
                Vertrags-PDF erzeugen
              </a>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Das Muster vor Unterschrift zusammen mit Angebot, AGB und AVV
                rechtlich auf den konkreten Auftrag prüfen.
              </p>
              <PrepareContractForm tenantId={tenant.id} />
            </>
          ) : (
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Weise zuerst ein Paket zu, damit Laufzeit und Vertrag erzeugt
              werden können.
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            Stammdaten
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Rechnungsanschrift</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Die Anschrift wird beim Einrichten abgefragt und kann für Rechnungen
            und Vertragsdokumente getrennt vom Fahrschulstandort gepflegt
            werden.
          </p>
          <BillingProfileForm profile={billing.profile} tenantId={tenant.id} />
        </Card>
      </section>
      <Card className="mt-7 overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white p-6">
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-800 uppercase">
            Digitale Unterschrift
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Vertragsakte</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Jeder vorbereitete Stand wird als unveränderliches PDF mit
            SHA-256-Prüfsumme gespeichert. Der Versand wird freigeschaltet,
            sobald ein eIDAS-Signaturanbieter verbunden ist.
          </p>
        </div>
        <div className="space-y-3 p-6">
          {contracts.length ? (
            contracts.map((contract) => (
              <div
                className="rounded-2xl border border-slate-200 p-4"
                key={contract.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{contract.contractNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatter.format(contract.createdAt)} · Prüfsumme{" "}
                      <span className="font-mono">
                        {contract.sha256.slice(0, 12)}…
                      </span>
                    </p>
                    {contract.signatureRequest ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Signatur: {contract.signatureRequest.signerEmail} ·{" "}
                        {contract.signatureRequest.provider}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge
                    tone={contract.status === "signed" ? "success" : "warning"}
                  >
                    {contractStatusLabels[contract.status]}
                  </StatusBadge>
                </div>
                <div className="mt-4 flex flex-wrap items-start gap-2">
                  <a
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                    href={`/api/vertraege/${contract.id}`}
                  >
                    Original laden
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
                  {contract.status === "prepared" ||
                  contract.status === "expired" ? (
                    <SendContractForm
                      documentId={contract.id}
                      tenantId={tenant.id}
                    />
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Noch kein Vertragsstand fixiert. Prüfe zuerst Paket, Laufzeit und
              Rechnungsanschrift.
            </p>
          )}
        </div>
      </Card>
      <section className="mt-7 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
            Accountable-Abgleich
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Rechnung hinterlegen</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Lade nach dem Versand über Accountable eine PDF-Kopie hoch. Die
            Originalrechnung und steuerliche Archivierung bleiben in
            Accountable.
          </p>
          <InvoiceUploadForm tenantId={tenant.id} />
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Historie
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Rechnungen</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {billing.invoices.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {billing.invoices.length ? (
              billing.invoices.map((invoice) => (
                <div
                  className="rounded-2xl border border-slate-200 p-4"
                  key={invoice.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatter.format(invoice.issuedAt)} ·{" "}
                        {moneyFormatter.format(invoice.grossAmountCents / 100)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "overdue"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {invoice.status === "paid"
                        ? "Bezahlt"
                        : invoice.status === "overdue"
                          ? "Überfällig"
                          : invoice.status === "cancelled"
                            ? "Storniert"
                            : "Offen"}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                      href={`/api/rechnungen/${invoice.id}`}
                    >
                      PDF laden
                    </a>
                    {invoice.status !== "paid" ? (
                      <form action={updateInvoiceStatusAction}>
                        <input
                          name="tenantId"
                          type="hidden"
                          value={tenant.id}
                        />
                        <input
                          name="invoiceId"
                          type="hidden"
                          value={invoice.id}
                        />
                        <input name="status" type="hidden" value="paid" />
                        <button className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
                          Als bezahlt markieren
                        </button>
                      </form>
                    ) : null}
                    {invoice.status === "open" ? (
                      <form action={updateInvoiceStatusAction}>
                        <input
                          name="tenantId"
                          type="hidden"
                          value={tenant.id}
                        />
                        <input
                          name="invoiceId"
                          type="hidden"
                          value={invoice.id}
                        />
                        <input name="status" type="hidden" value="overdue" />
                        <button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                          Als überfällig markieren
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Noch keine Rechnungskopie hinterlegt.
              </p>
            )}
          </div>
        </Card>
      </section>
      <section className="mt-7 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white p-6">
            <p className="text-xs font-semibold tracking-[.16em] text-cyan-800 uppercase">
              Externe Kundendomain
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              DNS ohne Anbieterwechsel verbinden
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Die Domain kann beim bisherigen Anbieter bleiben. Dort werden nur
              die Web-DNS-Einträge angepasst; E-Mail- und MX-Einträge bleiben
              unverändert.
            </p>
          </div>
          <div className="p-6">
            {tenant.domain && tenant.domainId ? (
              <DomainManagement
                domainId={tenant.domainId}
                hostname={tenant.domain}
                sslStatus={tenant.sslStatus ?? "unknown"}
                status={tenant.domainStatus ?? "pending"}
                tenantId={tenant.id}
              />
            ) : (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                Für diesen Mandanten wurde noch keine primäre Domain
                gespeichert.
              </p>
            )}
            <div className="mt-7 space-y-3">
              <h3 className="font-semibold">Einträge beim Domainanbieter</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="mobile-stack-table w-full min-w-[34rem] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3">Host</th>
                      <th className="p-3">Typ</th>
                      <th className="p-3">Ziel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainIsSubdomain ? (
                      <tr className="border-t border-slate-100">
                        <td className="p-3 font-mono" data-label="Host">
                          {dnsHost}
                        </td>
                        <td className="p-3" data-label="Typ">
                          CNAME
                        </td>
                        <td className="p-3 font-mono" data-label="Ziel">
                          {dnsTarget.hostname}
                        </td>
                      </tr>
                    ) : null}
                    {!domainIsSubdomain
                      ? dnsTarget.ipv4.map((address) => (
                          <tr
                            className="border-t border-slate-100"
                            key={address}
                          >
                            <td className="p-3 font-mono" data-label="Host">
                              @
                            </td>
                            <td className="p-3" data-label="Typ">
                              A
                            </td>
                            <td className="p-3 font-mono" data-label="Ziel">
                              {address}
                            </td>
                          </tr>
                        ))
                      : null}
                    {!domainIsSubdomain
                      ? dnsTarget.ipv6.map((address) => (
                          <tr
                            className="border-t border-slate-100"
                            key={address}
                          >
                            <td className="p-3 font-mono" data-label="Host">
                              @
                            </td>
                            <td className="p-3" data-label="Typ">
                              AAAA
                            </td>
                            <td
                              className="p-3 font-mono break-all"
                              data-label="Ziel"
                            >
                              {address}
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Bei Anbietern mit ALIAS/ANAME oder CNAME-Flattening kann auch
                die Hauptdomain auf{" "}
                <span className="font-mono">{dnsTarget.hostname}</span> zeigen.
                Vorhandene MX-, SPF-, DKIM- und DMARC-Einträge nicht löschen.
                DNS-Änderungen können abhängig vom Anbieter mehrere Stunden
                benötigen.
              </p>
            </div>
          </div>
        </Card>
        <div className="grid gap-5">
          <Card>
            <p className="text-xs font-semibold tracking-[.14em] text-cyan-700 uppercase">
              Freigabeablauf
            </p>
            <ol className="mt-5 space-y-4 text-sm">
              {[
                "Domain beim Kunden oder Provider erfassen",
                "Angezeigte DNS-Einträge setzen",
                "DNS & SSL mit einem Klick prüfen",
                "Zertifikat in Plesk für die Domain bereitstellen",
                "Rechtstexte prüfen und Wartungsmodus beenden",
              ].map((item, index) => (
                <li className="flex gap-3" key={item}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 leading-5 text-slate-600">{item}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Gebuchtes Paket</p>
            <p className="mt-1 text-xl font-semibold">
              {tenant.planName ?? "Noch nicht zugewiesen"}
            </p>
            <TenantPlanForm
              currentPlanName={tenant.planName}
              plans={availablePlans
                .filter((plan) => plan.active)
                .map(({ id, publicName }) => ({ id, publicName }))}
              tenantId={tenant.id}
            />
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Interne Kennung</p>
            <p className="mt-1 font-mono text-xs break-all">
              {tenant.customerNumber}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Zuletzt geändert: {formatter.format(tenant.updatedAt)}
            </p>
          </Card>
        </div>
      </section>
      <section className="mt-7 rounded-[2rem] border border-red-200 bg-red-50 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[.16em] text-red-700 uppercase">
          Gefahrenbereich
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-red-950">
          Mandant löschen
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-red-900/80">
          Entfernt den Mandanten, seine Website, Domains, Inhalte,
          Kontaktanfragen, Rechtstexte, Medienzuordnungen und nicht mehr
          benötigte Kundenzugänge. Protokolle mit Aufbewahrungszweck verlieren
          ihre Mandantenzuordnung. Dieser Vorgang kann nicht rückgängig gemacht
          werden.
        </p>
        <TenantDeleteForm tenantId={tenant.id} tenantName={tenant.name} />
      </section>
    </CustomerPage>
  );
}
