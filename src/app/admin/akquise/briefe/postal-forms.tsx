"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { parseSalesLeadTags } from "@/modules/platform/sales-tags";

import {
  archivePostalDispatchAction,
  deletePostalDispatchAction,
  preparePostalDispatchAction,
  submitPostalDispatchAction,
  syncPostalStatusesAction,
  type PostalActionState,
} from "./actions";

const initialState: PostalActionState = { message: "", error: false };

function Result({ state }: { state: PostalActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function ArchivePostalForm({
  dispatchId,
  archived,
}: {
  dispatchId: string;
  archived: boolean;
}) {
  const [state, action, pending] = useActionState(
    archivePostalDispatchAction,
    initialState,
  );
  return (
    <form action={action} className="mt-3">
      <input name="dispatchId" type="hidden" value={dispatchId} />
      <input name="archived" type="hidden" value={archived ? "no" : "yes"} />
      <button
        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Wird aktualisiert …"
          : archived
            ? "Aus Archiv zurückholen"
            : "Vorgang archivieren"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function SyncPostalStatusForm({ dispatchId }: { dispatchId?: string }) {
  const [state, action, pending] = useActionState(
    syncPostalStatusesAction,
    initialState,
  );
  return (
    <form action={action}>
      {dispatchId ? (
        <input name="dispatchId" type="hidden" value={dispatchId} />
      ) : null}
      <button
        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Status wird geprüft …" : "OnlineBrief24-Status prüfen"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function DeletePostalForm({
  dispatchId,
  submitted,
}: {
  dispatchId: string;
  submitted: boolean;
}) {
  const [state, action, pending] = useActionState(
    deletePostalDispatchAction,
    initialState,
  );
  return (
    <details className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-red-800">
        Briefvorgang löschen
      </summary>
      <p className="mt-2 text-xs leading-5 text-red-900">
        {submitted
          ? "FahrSeiten versucht zuerst, den Auftrag bei OnlineBrief24 zu löschen. Das ist laut Anbieter nur innerhalb von 15 Minuten und nicht mehr nach Abschluss möglich."
          : "Der lokale PDF-Entwurf und der Briefvorgang werden entfernt. Die Löschung bleibt in der Kundenhistorie nachvollziehbar."}
      </p>
      <form action={action} className="mt-3">
        <input name="dispatchId" type="hidden" value={dispatchId} />
        <button
          className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Wird gelöscht …" : "Jetzt endgültig löschen"}
        </button>
        <Result state={state} />
      </form>
    </details>
  );
}

export function PreparePostalForm({
  leads,
  logos,
  defaultLogoId,
  media,
  templates,
}: {
  leads: {
    id: string;
    companyName: string;
    addressComplete: boolean;
    tags: string | null;
    researchNote: string | null;
  }[];
  logos: { id: string; label: string; url: string }[];
  defaultLogoId: string;
  media: { id: string; label: string }[];
  templates: {
    id: string;
    name: string;
    kickerTemplate: string;
    headlineTemplate: string;
    bodyTemplate: string;
  }[];
}) {
  const [state, action, pending] = useActionState(
    preparePostalDispatchAction,
    initialState,
  );
  const firstTemplate = templates[0];
  const [tagFilter, setTagFilter] = useState("");
  const [kicker, setKicker] = useState(
    firstTemplate?.kickerTemplate ?? "FAHRSEITEN FÜR FAHRSCHULEN",
  );
  const [headline, setHeadline] = useState(
    firstTemplate?.headlineTemplate ??
      "Ihre Website sollte mitfahren – nicht aufhalten.",
  );
  const [bodyText, setBodyText] = useState(
    firstTemplate?.bodyTemplate ??
      "FahrSeiten verbindet einen modernen Webauftritt mit einem übersichtlichen Arbeitsbereich.",
  );
  const availableTags = [
    ...new Set(leads.flatMap((lead) => parseSalesLeadTags(lead.tags))),
  ].sort((a, b) => a.localeCompare(b, "de"));
  const visibleLeads = tagFilter
    ? leads.filter((lead) => parseSalesLeadTags(lead.tags).includes(tagFilter))
    : leads;
  const availableLeadIds = visibleLeads
    .filter((lead) => lead.addressComplete)
    .map((lead) => lead.id);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState(
    logos.some((logo) => logo.id === defaultLogoId)
      ? defaultLogoId
      : (logos[0]?.id ?? ""),
  );
  const selectedLogo = logos.find((logo) => logo.id === selectedLogoId);
  return (
    <form action={action} className="min-w-0 space-y-4">
      <fieldset className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <legend className="text-sm font-semibold">
              Empfänger auswählen
            </legend>
            <p className="mt-1 text-xs text-slate-500">
              {selectedLeadIds.length} von maximal 50 ausgewählt
            </p>
          </div>
          <label className="max-w-full min-w-0 text-xs font-semibold text-slate-600">
            Tag
            <select
              className="mt-1 min-h-9 max-w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-800 sm:mt-0 sm:ml-2"
              onChange={(event) => {
                setTagFilter(event.target.value);
                setSelectedLeadIds([]);
              }}
              value={tagFilter}
            >
              <option value="">Alle</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
              onClick={() => setSelectedLeadIds(availableLeadIds.slice(0, 50))}
              type="button"
            >
              Alle mit Anschrift
            </button>
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              onClick={() => setSelectedLeadIds([])}
              type="button"
            >
              Auswahl leeren
            </button>
          </div>
        </div>
        <div className="mt-4 max-h-64 max-w-full space-y-2 overflow-x-hidden overflow-y-auto pr-1">
          {visibleLeads.map((lead) => {
            const checked = selectedLeadIds.includes(lead.id);
            return (
              <label
                className={`flex max-w-full min-w-0 items-start gap-3 overflow-hidden rounded-xl border p-3 text-sm ${lead.addressComplete ? "cursor-pointer border-slate-200 hover:border-cyan-300" : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"}`}
                key={lead.id}
              >
                <input
                  checked={checked}
                  className="mt-0.5 shrink-0"
                  disabled={!lead.addressComplete}
                  name="leadIds"
                  onChange={(event) =>
                    setSelectedLeadIds((current) =>
                      event.target.checked
                        ? current.length < 50
                          ? [...current, lead.id]
                          : current
                        : current.filter((id) => id !== lead.id),
                    )
                  }
                  type="checkbox"
                  value={lead.id}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold [overflow-wrap:anywhere] break-words">
                    {lead.companyName}
                    {lead.addressComplete ? "" : " – Anschrift fehlt"}
                  </span>
                  {parseSalesLeadTags(lead.tags).length ? (
                    <span className="mt-1 flex max-w-full min-w-0 flex-wrap gap-1">
                      {parseSalesLeadTags(lead.tags).map((tag) => (
                        <span
                          className="max-w-full rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold [overflow-wrap:anywhere] break-words text-cyan-900"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {lead.researchNote ? (
                    <span className="mt-1 line-clamp-2 max-w-full text-xs leading-5 font-normal [overflow-wrap:anywhere] break-words text-slate-500">
                      {lead.researchNote}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold">
        Briefkopf-Logo
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="logoMediaId"
          onChange={(event) => setSelectedLogoId(event.target.value)}
          required
          value={selectedLogoId}
        >
          <option value="" disabled>
            Logo aus dem Plattform-Medienbereich auswählen
          </option>
          {logos.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Dieses Bild wird verbindlich in den Briefkopf eingebettet. Fehlt die
          Auswahl, wird kein PDF erstellt.
        </span>
        {selectedLogo ? (
          <span className="mt-3 flex min-h-20 items-center rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#fff_0_50%,#07111f_50%)] p-3">
            <Image
              alt="Ausgewähltes Briefkopf-Logo"
              className="h-14 w-auto max-w-full object-contain p-2"
              height={80}
              src={selectedLogo.url}
              width={280}
            />
          </span>
        ) : null}
      </label>
      <label className="block text-sm font-semibold">
        Briefvorlage
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          defaultValue={firstTemplate?.id ?? ""}
          onChange={(event) => {
            const template = templates.find(
              (item) => item.id === event.target.value,
            );
            if (!template) return;
            setKicker(template.kickerTemplate);
            setHeadline(template.headlineTemplate);
            setBodyText(template.bodyTemplate);
          }}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Die Vorlage füllt Überschrift und Text. Beides kann für diesen Brief
          noch angepasst werden.
        </span>
      </label>
      <label className="block text-sm font-semibold">
        Prägnante Catcher-Zeile
        <input
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          maxLength={120}
          name="kicker"
          onChange={(event) => setKicker(event.target.value)}
          required
          value={kicker}
        />
      </label>
      <label className="block text-sm font-semibold">
        Überschrift
        <input
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="headline"
          onChange={(event) => setHeadline(event.target.value)}
          required
          value={headline}
        />
      </label>
      <label className="block text-sm font-semibold">
        Persönlicher Brieftext
        <textarea
          className="mt-2 min-h-48 w-full rounded-xl border border-slate-300 p-3 leading-6 font-normal"
          maxLength={1200}
          name="bodyText"
          onChange={(event) => setBodyText(event.target.value)}
          required
          value={bodyText}
        />
      </label>
      <label className="block text-sm font-semibold">
        Optionales Bild aus dem Plattform-Medienbereich
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="imageMediaId"
        >
          <option value="">Ohne zusätzliches Bild</option>
          {media.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">
        <input defaultChecked name="color" type="checkbox" value="yes" />
        Farbdruck verwenden
      </label>
      <button
        className="premium-button"
        disabled={pending || selectedLeadIds.length === 0 || !selectedLogoId}
        type="submit"
      >
        {pending
          ? `${selectedLeadIds.length} PDF${selectedLeadIds.length === 1 ? "" : "s"} werden erstellt …`
          : `${selectedLeadIds.length || "Keine"} Akquisebrief${selectedLeadIds.length === 1 ? "" : "e"} vorbereiten`}
      </button>
      <Result state={state} />
    </form>
  );
}

export function SubmitPostalForm({
  dispatchId,
  companyName,
  mode,
  recipientAddress,
}: {
  dispatchId: string;
  companyName: string;
  mode: "test" | "live";
  recipientAddress: string;
}) {
  const [state, action, pending] = useActionState(
    submitPostalDispatchAction,
    initialState,
  );
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const live = mode === "live";
  return (
    <form action={action} className="mt-3">
      <input name="dispatchId" type="hidden" value={dispatchId} />
      <button
        className={`mt-3 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${live ? "bg-red-700" : "bg-cyan-700"}`}
        disabled={pending}
        onClick={() => {
          setApproved(false);
          setConfirmationOpen(true);
        }}
        type="button"
      >
        {live ? "Liveversand prüfen" : "Testübertragung prüfen"}
      </button>
      {confirmationOpen ? (
        <div
          aria-labelledby={`postal-confirmation-${dispatchId}`}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-[1.75rem] border border-white/20 bg-white p-5 shadow-2xl sm:p-7">
            <p
              className={`text-xs font-bold tracking-[.16em] uppercase ${live ? "text-red-700" : "text-cyan-700"}`}
            >
              Letzter Versandcheck
            </p>
            <h3
              className="mt-2 text-2xl font-semibold text-slate-950"
              id={`postal-confirmation-${dispatchId}`}
            >
              {live
                ? "Brief kostenpflichtig versenden?"
                : "Brief an den Testwarenkorb übertragen?"}
            </h3>
            <dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Empfänger
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {companyName}
                </dd>
                <dd className="mt-0.5 text-slate-600">{recipientAddress}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Modus</dt>
                <dd
                  className={`mt-1 font-semibold ${live ? "text-red-700" : "text-cyan-800"}`}
                >
                  {live ? "Live · kostenpflichtig" : "Testwarenkorb"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Lead-ID und persönlicher QR-Link werden automatisch aus der
              Kundenakte übernommen. Du musst keine ID eintragen.
            </p>
            <a
              className="mt-3 inline-flex text-sm font-semibold text-cyan-800 underline"
              href={`/api/admin/akquise/briefe/${dispatchId}`}
              rel="noreferrer"
              target="_blank"
            >
              PDF vor dem Versand noch einmal öffnen
            </a>
            <label
              className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 font-semibold ${live ? "border-red-200 bg-red-50 text-red-950" : "border-cyan-200 bg-cyan-50 text-cyan-950"}`}
            >
              <input
                checked={approved}
                className="mt-1 size-5 shrink-0"
                name="sendApproved"
                onChange={(event) => setApproved(event.target.checked)}
                required
                type="checkbox"
                value="yes"
              />
              Ich habe Empfänger, Anschrift und PDF geprüft und bestätige
              {live
                ? " den kostenpflichtigen Versand."
                : " die Übertragung in den Testwarenkorb."}
            </label>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                disabled={pending}
                onClick={() => setConfirmationOpen(false)}
                type="button"
              >
                Abbrechen
              </button>
              <button
                className={`rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${live ? "bg-red-700" : "bg-cyan-700"}`}
                disabled={!approved || pending}
                type="submit"
              >
                {pending
                  ? "Wird übertragen …"
                  : live
                    ? "Jetzt kostenpflichtig versenden"
                    : "Jetzt an Testwarenkorb senden"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <Result state={state} />
    </form>
  );
}
