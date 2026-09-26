"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import {
  salesStageLabels,
  salesStages,
  type LeadStatus,
} from "@/modules/platform/sales-stages";
import {
  parseSalesLeadTags,
  salesLeadTagSuggestions,
} from "@/modules/platform/sales-tags";

import {
  createLeadAction,
  deleteLeadBatchAction,
  deleteLeadAction,
  importSalesCsvAction,
  saveSalesTemplateAction,
  startOutreachAction,
  updateLeadAction,
  type SalesActionState,
} from "./actions";

const initialState: SalesActionState = { message: "", error: false };

function Result({ state }: { state: SalesActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-xs font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function CsvImportForm() {
  const [state, action, pending] = useActionState(
    importSalesCsvAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6"
      encType="multipart/form-data"
    >
      <h2 className="text-xl font-semibold">Kontakte aus CSV übernehmen</h2>
      <p className="mt-2 text-sm text-slate-600">
        Die Kopfzeile wird geprüft. Kontakte mit bereits vorhandener
        E-Mail-Adresse werden übersprungen. Tags werden mit <strong>|</strong>
        getrennt; der Kommentar bleibt als dauerhafte Recherche-Notiz in der
        Kundenakte erhalten.
      </p>
      <input
        accept=".csv,text/csv"
        className="mt-5 block w-full text-sm"
        name="file"
        required
        type="file"
      />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="premium-button disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Importiert …" : "CSV importieren"}
        </button>
        <a
          className="text-sm font-semibold text-cyan-800 underline"
          href="/api/admin/akquise/csv-vorlage"
        >
          CSV-Vorlage herunterladen
        </a>
      </div>
      <Result state={state} />
    </form>
  );
}

export function SalesTemplateForm() {
  const [state, action, pending] = useActionState(
    saveSalesTemplateAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold">Neue Vorlage</h2>
      <p className="mt-2 text-sm text-slate-600">
        Erlaubte Platzhalter: {"{{Fahrschule}}"}, {"{{Ansprechpartner}}"},{" "}
        {"{{Webseite}}"} und {"{{Beispiel-Webseite}}"}. Die HTML-Fassung wird
        sicher aus diesem Text erzeugt.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-semibold">
          Name
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="name"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Betreff
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="subjectTemplate"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          E-Mail-Text
          <textarea
            className="mt-1 min-h-72 w-full rounded-xl border border-slate-300 p-3 font-normal"
            name="bodyTemplate"
            required
          />
        </label>
      </div>
      <button
        className="premium-button mt-5 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Speichert …" : "Vorlage speichern"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function OutreachForm({
  leads,
  templates,
}: {
  leads: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    tags: string | null;
    researchNote: string | null;
    status: string;
    emailPermission: string;
    emailOptOutAt: Date | null;
    latestOutreach?: {
      status: string;
      lastErrorCode: string | null;
      completedAt: Date | null;
    } | null;
  }[];
  templates: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    startOutreachAction,
    initialState,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteState, setDeleteState] = useState(initialState);
  const [deletePending, startDeleteTransition] = useTransition();
  const [tagFilter, setTagFilter] = useState("");
  const availableTags = [
    ...new Set(leads.flatMap((lead) => parseSalesLeadTags(lead.tags))),
  ].sort((a, b) => a.localeCompare(b, "de"));
  const visibleLeads = tagFilter
    ? leads.filter((lead) => parseSalesLeadTags(lead.tags).includes(tagFilter))
    : leads;
  const selectedLeads = leads.filter((lead) => selectedIds.includes(lead.id));
  const selectedForEmail = selectedLeads.every(
    (lead) =>
      Boolean(lead.email) &&
      ["consent", "existing_customer"].includes(lead.emailPermission) &&
      !lead.emailOptOutAt,
  );
  const deleteContacts = (ids: string[], label: string) => {
    if (
      !window.confirm(
        `${label} endgültig löschen? Verknüpfte Kundeninstanzen oder bereits übertragene Briefe werden nicht gelöscht und stattdessen gemeldet.`,
      )
    )
      return;
    const formData = new FormData();
    ids.forEach((id) => formData.append("leadIds", id));
    formData.set("confirmation", "AUSWAHL LÖSCHEN");
    startDeleteTransition(async () => {
      const result = await deleteLeadBatchAction(initialState, formData);
      setDeleteState(result);
      setSelectedIds([]);
    });
  };
  return (
    <form action={action}>
      <div className="sticky top-4 z-10 mb-4 grid gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur lg:grid-cols-[minmax(16rem,1fr)_minmax(20rem,1.4fr)_auto] lg:items-end">
        <label className="min-w-0 flex-1 text-sm font-semibold">
          E-Mail-Vorlage
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="templateId"
            required
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 font-semibold text-amber-950">
          <input
            className="mt-0.5 size-4 shrink-0"
            name="contactPermissionConfirmed"
            required
            type="checkbox"
            value="yes"
          />
          Ich habe für alle ausgewählten Kontakte geprüft und dokumentiert, dass
          diese konkrete E-Mail zulässig ist.
        </label>
        <button
          className="premium-button disabled:opacity-50"
          disabled={pending || !selectedIds.length || !selectedForEmail}
          type="submit"
        >
          {pending ? "Plant Versand …" : "Akquise für Auswahl starten"}
        </button>
        <div className="lg:col-span-3">
          <Result state={state} />
          {selectedIds.length && !selectedForEmail ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">
              Die Auswahl enthält Kontakte ohne dokumentierte
              E-Mail-Versandfreigabe. Löschen und Bearbeiten bleiben möglich;
              der E-Mail-Versand ist für diese Auswahl gesperrt.
            </p>
          ) : null}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="mr-2 text-xs font-semibold text-slate-600">
          Nach Tag filtern
          <select
            className="ml-2 min-h-9 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-800"
            onChange={(event) => {
              setTagFilter(event.target.value);
              setSelectedIds([]);
            }}
            value={tagFilter}
          >
            <option value="">Alle Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          onClick={() => setSelectedIds(visibleLeads.map((lead) => lead.id))}
          type="button"
        >
          Alle markieren
        </button>
        <button
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
          onClick={() => setSelectedIds([])}
          type="button"
        >
          Auswahl aufheben
        </button>
        <button
          className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!selectedIds.length || deletePending}
          onClick={() =>
            deleteContacts(
              selectedIds,
              `${selectedIds.length} ausgewählte Kontakte`,
            )
          }
          type="button"
        >
          {deletePending
            ? "Auswahl wird gelöscht …"
            : `${selectedIds.length || 0} Kontakte löschen`}
        </button>
        <span className="ml-auto text-xs font-semibold text-slate-500">
          {selectedIds.length} markiert · {visibleLeads.length} von{" "}
          {leads.length} sichtbar
        </span>
        <div className="w-full">
          <Result state={deleteState} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="mobile-stack-table w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="p-4">Auswahl</th>
              <th className="p-4">Fahrschule</th>
              <th className="p-4">Kontakt</th>
              <th className="p-4">Webseite</th>
              <th className="p-4">Tags & Hinweis</th>
              <th className="p-4">Status</th>
              <th className="p-4">E-Mail</th>
              <th className="p-4">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="p-4" data-label="Auswahl">
                  <input
                    aria-label={`${lead.companyName} auswählen`}
                    checked={selectedIds.includes(lead.id)}
                    name="leadIds"
                    onChange={(event) =>
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, lead.id]
                          : current.filter((id) => id !== lead.id),
                      )
                    }
                    type="checkbox"
                    value={lead.id}
                  />
                </td>
                <td className="p-4 font-semibold" data-label="Fahrschule">
                  {lead.companyName}
                </td>
                <td className="p-4" data-label="Kontakt">
                  <div>{lead.contactName || "–"}</div>
                  <div className="text-slate-500">
                    {lead.email || lead.phone || "Keine Kontaktdaten"}
                  </div>
                </td>
                <td className="p-4" data-label="Webseite">
                  {lead.website ? (
                    <a
                      className="text-cyan-800 underline"
                      href={lead.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Website öffnen
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="p-4" data-label="Tags & Hinweis">
                  <div className="flex max-w-64 flex-wrap gap-1.5">
                    {parseSalesLeadTags(lead.tags).length ? (
                      parseSalesLeadTags(lead.tags).map((tag) => (
                        <span
                          className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-900"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">Keine Tags</span>
                    )}
                  </div>
                  {lead.researchNote ? (
                    <p className="mt-2 max-w-64 text-xs leading-5 text-slate-500">
                      {lead.researchNote}
                    </p>
                  ) : null}
                </td>
                <td className="p-4" data-label="Status">
                  {lead.status}
                </td>
                <td className="p-4 text-xs font-semibold" data-label="E-Mail">
                  <div
                    className={`mb-2 ${lead.emailOptOutAt ? "text-red-700" : ["consent", "existing_customer"].includes(lead.emailPermission) ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {lead.emailOptOutAt
                      ? "Abgemeldet"
                      : lead.emailPermission === "consent"
                        ? "Einwilligung dokumentiert"
                        : lead.emailPermission === "existing_customer"
                          ? "Bestandskunden-Ausnahme"
                          : "Keine Versandfreigabe"}
                  </div>
                  {!lead.latestOutreach
                    ? "Noch nicht versendet"
                    : lead.latestOutreach.status === "completed"
                      ? "SMTP angenommen"
                      : lead.latestOutreach.status === "failed"
                        ? `Fehler${lead.latestOutreach.lastErrorCode ? `: ${lead.latestOutreach.lastErrorCode}` : ""}`
                        : "Versand wartet"}
                </td>
                <td className="p-4" data-label="Aktionen">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-900"
                      href={`/admin/akquise/${lead.id}`}
                    >
                      Bearbeiten
                    </Link>
                    <button
                      className="inline-flex rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                      disabled={deletePending}
                      onClick={() =>
                        deleteContacts([lead.id], `„${lead.companyName}“`)
                      }
                      type="button"
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

export function CreateLeadForm() {
  const [state, action, pending] = useActionState(
    createLeadAction,
    initialState,
  );
  return (
    <details className="group rounded-[2rem] border border-cyan-100 bg-cyan-50 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-cyan-950">
        <span>+ Kundenakte manuell anlegen</span>
        <span className="text-xl transition group-open:rotate-45">+</span>
      </summary>
      <form
        action={action}
        className="mt-5 grid gap-4 border-t border-cyan-100 pt-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="text-sm font-semibold">
          Fahrschule / Firma
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="companyName"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Ansprechperson
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="contactName"
          />
        </label>
        <label className="text-sm font-semibold">
          E-Mail
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="email"
            type="email"
          />
        </label>
        <label className="text-sm font-semibold">
          Telefon
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="phone"
            type="tel"
          />
        </label>
        <label className="text-sm font-semibold">
          Website
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="website"
            placeholder="https://"
            type="url"
          />
        </label>
        <label className="text-sm font-semibold">
          Straße und Hausnummer
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="street"
          />
        </label>
        <label className="text-sm font-semibold">
          PLZ
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="postalCode"
          />
        </label>
        <label className="text-sm font-semibold">
          Ort
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="city"
          />
        </label>
        <label className="text-sm font-semibold">
          Land
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            defaultValue="Deutschland"
            name="country"
          />
        </label>
        <label className="text-sm font-semibold">
          Wiedervorlage
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="nextTaskAt"
            type="datetime-local"
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">
          Tags
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            list="sales-tag-suggestions-create"
            name="tags"
            placeholder="Rechtlich veraltet, Aktuelle Wartungen"
          />
          <datalist id="sales-tag-suggestions-create">
            {salesLeadTagSuggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Mehrere Tags mit Komma trennen.
          </span>
        </label>
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">
          Recherche-Kommentar
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-cyan-200 bg-white p-3 font-normal"
            name="researchNote"
            placeholder="Konkrete Beobachtung zur Website; vor der Ansprache manuell prüfen."
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">
          Erste Notiz
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-cyan-200 bg-white p-3 font-normal"
            name="note"
          />
        </label>
        <label className="text-sm font-semibold">
          E-Mail-Freigabe
          <select
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            defaultValue="unknown"
            name="emailPermission"
          >
            <option value="unknown">Noch nicht vorhanden</option>
            <option value="consent">Ausdrückliche Einwilligung</option>
            <option value="existing_customer">
              Bestandskunden-Ausnahme (§ 7 Abs. 3 UWG vollständig erfüllt)
            </option>
          </select>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Nachweis der Freigabe
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="emailPermissionEvidence"
            placeholder="z. B. Einwilligung über Formular am 18.09.2026"
          />
        </label>
        <div>
          <button
            className="premium-button disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            {pending ? "Legt an …" : "Kundenakte anlegen"}
          </button>
          <Result state={state} />
        </div>
      </form>
    </details>
  );
}

export function LeadControls({
  lead,
}: {
  lead: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    tags: string | null;
    researchNote: string | null;
    status: LeadStatus;
    nextTaskAt: Date | null;
    emailPermission: string;
    emailPermissionEvidence: string | null;
    emailOptOutAt: Date | null;
    postalResponse: string | null;
    campaignUrl: string;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    country: string;
  };
}) {
  const [state, action, pending] = useActionState(
    updateLeadAction,
    initialState,
  );
  const dateValue = lead.nextTaskAt
    ? new Date(
        lead.nextTaskAt.getTime() -
          lead.nextTaskAt.getTimezoneOffset() * 60_000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
  return (
    <details className="group mt-4 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-cyan-800">
        Bearbeiten und Notiz erfassen →
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <input name="id" type="hidden" value={lead.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Fahrschule / Firma
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.companyName}
              name="companyName"
              required
            />
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Tags
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={parseSalesLeadTags(lead.tags).join(", ")}
              list={`sales-tag-suggestions-${lead.id}`}
              name="tags"
              placeholder="Rechtlich veraltet, Aktuelle Wartungen"
            />
            <datalist id={`sales-tag-suggestions-${lead.id}`}>
              {salesLeadTagSuggestions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Recherche-Kommentar
            <textarea
              className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal"
              defaultValue={lead.researchNote ?? ""}
              name="researchNote"
              placeholder="Beobachtung sachlich dokumentieren und vor dem Briefversand prüfen"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Ansprechperson
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.contactName ?? ""}
              name="contactName"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            E-Mail
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.email ?? ""}
              name="email"
              type="email"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Telefon
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.phone ?? ""}
              name="phone"
              type="tel"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Website
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.website ?? ""}
              name="website"
              placeholder="https://"
              type="url"
            />
          </label>
        </div>
        <select
          className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          defaultValue={lead.status}
          name="status"
        >
          {salesStages.map((status) => (
            <option key={status} value={status}>
              {salesStageLabels[status]}
            </option>
          ))}
        </select>
        <input
          className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          defaultValue={dateValue}
          name="nextTaskAt"
          type="datetime-local"
        />
        <textarea
          className="min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm"
          name="note"
          placeholder="Gespräch, Ergebnis oder nächster Schritt …"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Straße und Hausnummer
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.street ?? ""}
              name="street"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            PLZ
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.postalCode ?? ""}
              name="postalCode"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Ort
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.city ?? ""}
              name="city"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Land
            <input
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              defaultValue={lead.country}
              name="country"
            />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          E-Mail-Freigabe
          <select
            className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
            defaultValue={lead.emailPermission}
            disabled={Boolean(lead.emailOptOutAt)}
            name="emailPermission"
          >
            <option value="unknown">Noch nicht vorhanden</option>
            <option value="consent">Ausdrückliche Einwilligung</option>
            <option value="existing_customer">
              Bestandskunden-Ausnahme (§ 7 Abs. 3 UWG vollständig erfüllt)
            </option>
            <option value="withdrawn">Abgemeldet / gesperrt</option>
          </select>
        </label>
        {lead.emailOptOutAt ? (
          <input name="emailPermission" type="hidden" value="withdrawn" />
        ) : null}
        <label className="block text-xs font-semibold text-slate-700">
          Nachweis
          <textarea
            className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal"
            defaultValue={lead.emailPermissionEvidence ?? ""}
            name="emailPermissionEvidence"
            placeholder="Quelle und Zeitpunkt der Einwilligung dokumentieren"
          />
        </label>
        <button
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Result state={state} />
      </form>
      <details className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-cyan-950">
          Brief-Link & QR-Code
        </summary>
        <p className="mt-3 text-xs leading-5 text-slate-600">
          Dieser persönliche Link führt zur gesonderten Akquise-Landingpage und
          darf nur im Brief an diesen Kontakt verwendet werden.
        </p>
        <input
          className="mt-3 min-h-10 w-full rounded-lg border border-cyan-200 bg-white px-3 text-xs"
          readOnly
          value={lead.campaignUrl}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
            href={lead.campaignUrl}
            rel="noreferrer"
            target="_blank"
          >
            Landingpage öffnen
          </a>
          <a
            className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-semibold text-cyan-900"
            download
            href={`/api/admin/akquise/${lead.id}/qr`}
          >
            QR-Code als SVG
          </a>
        </div>
        {lead.postalResponse ? (
          <p className="mt-3 text-xs font-semibold text-emerald-800">
            Antwort gespeichert: {lead.postalResponse}
          </p>
        ) : null}
      </details>
    </details>
  );
}

export function LeadDeletePanel({
  id,
  companyName,
  blocked,
}: {
  id: string;
  companyName: string;
  blocked: boolean;
}) {
  const [state, action, pending] = useActionState(
    deleteLeadAction,
    initialState,
  );
  const [confirmation, setConfirmation] = useState("");
  return (
    <section className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-6">
      <p className="text-xs font-bold tracking-[.16em] text-red-700 uppercase">
        Gefahrenbereich
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-red-950">
        Kundenakte vollständig löschen
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-red-900">
        Stammdaten, Akquise-Historie, vorbereitete Briefe und Versanddaten
        werden endgültig entfernt.
        {blocked
          ? " Diese Akte ist mit einer Kundeninstanz verbunden. Lösche zuerst die technische Instanz."
          : ""}
      </p>
      <form action={action} className="mt-5 max-w-xl space-y-3">
        <input name="id" type="hidden" value={id} />
        <label className="block text-sm font-semibold text-red-950">
          Zur Bestätigung „{companyName}“ eingeben
          <input
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-xl border border-red-300 bg-white px-3 font-normal"
            disabled={blocked}
            name="confirmation"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
        </label>
        <button
          className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={blocked || confirmation.trim() !== companyName || pending}
          type="submit"
        >
          {pending ? "Wird gelöscht …" : "Kundenakte endgültig löschen"}
        </button>
        <Result state={state} />
      </form>
    </section>
  );
}
