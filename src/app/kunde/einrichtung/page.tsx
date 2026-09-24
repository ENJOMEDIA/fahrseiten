import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  addVehicleSetupAction,
  saveLicenseSetupAction,
  saveLocationSetupAction,
  startBuilderFromGuideAction,
} from "./actions";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { GuidedSubmitButton } from "@/components/onboarding/guided-submit-button";
import { db } from "@/db/client";
import { licenseClasses, vehicles } from "@/db/schema";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  findWebsiteSetupState,
  websiteSetupSteps,
} from "@/modules/onboarding/website-setup";
import { standardLicenseClasses } from "@/modules/onboarding/license-class-catalog";

const weekdayNames = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];
const stepKeys = [
  "start",
  "klassen",
  "standort",
  "fahrzeuge",
  "details",
  "builder",
] as const;
type StepKey = (typeof stepKeys)[number];

function isStep(value: string | undefined): value is StepKey {
  return stepKeys.includes(value as StepKey);
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

export default async function CustomerSetupPage({
  searchParams,
}: {
  searchParams: Promise<{
    schritt?: string;
    gespeichert?: string;
    fehler?: string;
  }>;
}) {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  const query = await searchParams;
  const state = await findWebsiteSetupState(membership.tenantId);
  const current: StepKey = isStep(query.schritt) ? query.schritt : "start";
  const [classRows, fleet] = await Promise.all([
    db
      .select()
      .from(licenseClasses)
      .where(eq(licenseClasses.tenantId, membership.tenantId))
      .orderBy(asc(licenseClasses.position)),
    db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.tenantId, membership.tenantId),
          eq(vehicles.active, true),
        ),
      )
      .orderBy(asc(vehicles.position)),
  ]);
  const progressIndex = Math.max(0, stepKeys.indexOf(current));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Einrichtungsassistent" },
        ]}
      />
      <section className="mt-6 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_right,#164e63_0,transparent_45%),linear-gradient(135deg,#07111f,#0f172a)] px-5 py-7 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[.2em] text-cyan-300 uppercase">
            Dein geführter Start
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-[-.03em] sm:text-5xl">
            Aus Informationen wird deine Website.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Du brauchst keine fertigen Texte und keine Webdesign-Erfahrung. Wir
            fragen das Wichtigste in einer sinnvollen Reihenfolge ab und
            bereiten daraus die Bausteine für deine Website vor.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all"
                style={{ width: `${state.percent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-cyan-100">
              {state.completedCount}/{state.totalCount}
            </span>
          </div>
        </div>
      </section>

      {query.gespeichert ? (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ {query.gespeichert} gespeichert. Du kannst direkt weitermachen.
        </p>
      ) : null}
      {query.fehler ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {query.fehler}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="self-start rounded-[1.75rem] border border-slate-200 bg-white p-3 xl:sticky xl:top-5">
          <p className="px-3 pt-2 text-xs font-semibold tracking-[.15em] text-slate-500 uppercase">
            Einrichtung
          </p>
          <nav className="mt-3 space-y-1" aria-label="Einrichtungsschritte">
            {websiteSetupSteps.map((step, index) => {
              const href = `/kunde/einrichtung?schritt=${stepKeys[index + 1]}`;
              const done = state.completed[step.key];
              return (
                <Link
                  className={`flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50 ${current === stepKeys[index + 1] ? "bg-cyan-50 ring-1 ring-cyan-200" : ""}`}
                  href={href}
                  key={step.key}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {step.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {step.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {current === "start" ? (
            <div>
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                Etwa 10–15 Minuten
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-.03em] text-slate-950">
                Wir bauen zuerst dein Fundament.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Klassen, Standort und Fahrzeuge sind zentrale Daten. Du pflegst
                sie einmal – FahrSeiten setzt sie im Builder, in
                Kontaktbereichen und später auch in weiteren Modulen ein.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: "1",
                    title: "Auswählen",
                    text: "Angebot und Kerndaten festlegen.",
                  },
                  {
                    icon: "2",
                    title: "Vervollständigen",
                    text: "Texte und Bilder später jederzeit ergänzen.",
                  },
                  {
                    icon: "3",
                    title: "Gestalten",
                    text: "Theme wählen und fertige Module anordnen.",
                  },
                ].map((item) => (
                  <div className="rounded-2xl bg-slate-50 p-5" key={item.title}>
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                      {item.icon}
                    </span>
                    <h3 className="mt-4 font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-cyan-600 px-6 font-semibold text-white sm:w-auto"
                href="/kunde/einrichtung?schritt=klassen"
              >
                Einrichtung starten →
              </Link>
            </div>
          ) : null}

          {current === "klassen" ? (
            <form action={saveLicenseSetupAction}>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 1
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Welche Klassen bietet ihr an?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Hake euer Angebot an. Die vorformulierten Beschreibungen kannst
                du direkt anpassen oder zunächst übernehmen.
              </p>
              <div className="mt-7 grid gap-3 lg:grid-cols-2">
                {standardLicenseClasses.map((item) => {
                  const existing = classRows.find(
                    (row) => row.key === item.key,
                  );
                  return (
                    <label
                      className="group rounded-2xl border border-slate-200 p-4 transition has-checked:border-cyan-500 has-checked:bg-cyan-50/50"
                      key={item.key}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          className="size-5 accent-cyan-600"
                          defaultChecked={existing?.active ?? item.key === "B"}
                          name="classes"
                          type="checkbox"
                          value={item.key}
                        />
                        <span className="font-semibold text-slate-950">
                          {item.title}
                        </span>
                      </span>
                      <span className="mt-3 grid grid-cols-[5rem_1fr] gap-3">
                        <input
                          aria-label={`Mindestalter ${item.title}`}
                          className={inputClass}
                          defaultValue={existing?.minimumAge ?? item.age}
                          min="14"
                          name={`age_${item.key}`}
                          type="number"
                        />
                        <input
                          aria-label={`Beschreibung ${item.title}`}
                          className={inputClass}
                          defaultValue={existing?.description ?? item.text}
                          name={`description_${item.key}`}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
              <WizardButtons
                back="start"
                nextLabel="Klassen speichern & weiter"
              />
            </form>
          ) : null}

          {current === "standort" ? (
            <form action={saveLocationSetupAction}>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 2
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Wo und wann erreicht man euch?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Diese Angaben befüllen später Standortkarten und Kontaktteaser
                automatisch.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Standortname"
                  name="name"
                  defaultValue={state.location?.name ?? "Hauptstandort"}
                  required
                />
                <Field
                  label="Straße und Hausnummer"
                  name="street"
                  defaultValue={state.location?.street}
                  required
                />
                <Field
                  label="Postleitzahl"
                  name="postalCode"
                  defaultValue={state.location?.postalCode}
                  required
                />
                <Field
                  label="Ort"
                  name="city"
                  defaultValue={state.location?.city}
                  required
                />
                <Field
                  label="Telefon"
                  name="phone"
                  type="tel"
                  defaultValue={state.location?.phone ?? ""}
                />
                <Field
                  label="E-Mail"
                  name="email"
                  type="email"
                  defaultValue={state.location?.email ?? ""}
                />
              </div>
              <h3 className="mt-9 text-lg font-semibold text-slate-950">
                Öffnungszeiten
              </h3>
              <div className="mt-4 space-y-2">
                {weekdayNames.map((name, index) => {
                  const day = index + 1;
                  const saved = state.openingHours.find(
                    (entry) => entry.weekday === day,
                  );
                  const defaultClosed = saved ? saved.closed : day > 5;
                  return (
                    <div
                      className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-center"
                      key={name}
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {name}
                      </span>
                      <input
                        aria-label={`${name} von`}
                        className={inputClass}
                        defaultValue={saved?.opensAt ?? "08:00"}
                        name={`opens_${day}`}
                        type="time"
                      />
                      <input
                        aria-label={`${name} bis`}
                        className={inputClass}
                        defaultValue={saved?.closesAt ?? "18:00"}
                        name={`closes_${day}`}
                        type="time"
                      />
                      <label className="flex min-h-11 items-center gap-2 text-sm text-slate-600">
                        <input
                          className="size-4 accent-cyan-600"
                          defaultChecked={defaultClosed}
                          name={`closed_${day}`}
                          type="checkbox"
                        />{" "}
                        geschlossen
                      </label>
                    </div>
                  );
                })}
              </div>
              <WizardButtons
                back="klassen"
                nextLabel="Standort speichern & weiter"
              />
            </form>
          ) : null}

          {current === "fahrzeuge" ? (
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 3
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Zeig euren Fuhrpark.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ein Fahrzeug reicht für den Start. Fotos kannst du anschließend
                im Medienbereich ergänzen.
              </p>
              {fleet.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {fleet.map((item) => (
                    <div
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                      key={item.id}
                    >
                      <p className="font-semibold text-emerald-950">
                        ✓ {item.name}
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {item.category} ·{" "}
                        {item.transmission === "automatic"
                          ? "Automatik"
                          : "Schaltung"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              <form
                action={addVehicleSetupAction}
                className="mt-7 rounded-[1.5rem] bg-slate-50 p-4 sm:p-6"
              >
                <h3 className="font-semibold text-slate-950">
                  {fleet.length ? "Weiteres Fahrzeug" : "Erstes Fahrzeug"}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Modell oder Bezeichnung"
                    name="name"
                    placeholder="z. B. VW Golf 8"
                    required
                  />
                  <Field
                    label="Klasse / Kategorie"
                    name="category"
                    placeholder="z. B. Klasse B"
                    required
                  />
                  <label className="text-sm font-semibold text-slate-700">
                    Getriebe
                    <select
                      className={`${inputClass} mt-2`}
                      name="transmission"
                    >
                      <option value="manual">Schaltung</option>
                      <option value="automatic">Automatik</option>
                    </select>
                  </label>
                  <Field
                    label="Kurze Beschreibung"
                    name="description"
                    placeholder="z. B. modern, kompakt und leicht zu fahren"
                  />
                </div>
                <GuidedSubmitButton className="mt-5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 sm:w-auto">
                  + Fahrzeug speichern
                </GuidedSubmitButton>
              </form>
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold"
                  href="/kunde/einrichtung?schritt=standort"
                >
                  ← Zurück
                </Link>
                <Link
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white ${fleet.length ? "bg-cyan-600" : "pointer-events-none bg-slate-300"}`}
                  href="/kunde/einrichtung?schritt=details"
                >
                  Weiter zu Team & Preisen →
                </Link>
              </div>
            </div>
          ) : null}

          {current === "details" ? (
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 4
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Was schafft Vertrauen?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Team und Preise sind umfangreicher. Öffne die vorbereiteten
                Bereiche, ergänze mindestens einen Eintrag und kehre hierher
                zurück.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <SetupLink
                  done={state.counts.team > 0}
                  href="/kunde/inhalte/team"
                  title="Team vorstellen"
                  text="Name, Rolle, Qualifikation und optional ein Foto."
                />
                <SetupLink
                  done={state.counts.prices > 0}
                  href="/kunde/inhalte/preise"
                  title="Preise erklären"
                  text="Preisgruppen und Leistungen nachvollziehbar anlegen."
                />
                <SetupLink
                  done={false}
                  href="/kunde/rechtliches"
                  title="Rechtliches prüfen"
                  text="Impressum und Datenschutz vor Veröffentlichung freigeben."
                />
                <SetupLink
                  done={false}
                  href="/kunde/medien"
                  title="Bilder hochladen"
                  text="Logo, Team, Fahrzeuge und Standort sauber sortieren."
                />
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold"
                  href="/kunde/einrichtung?schritt=fahrzeuge"
                >
                  ← Zurück
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white"
                  href="/kunde/einrichtung?schritt=builder"
                >
                  Builder kennenlernen →
                </Link>
              </div>
            </div>
          ) : null}

          {current === "builder" ? (
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 5
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Jetzt wird daraus deine Seite.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Der Builder arbeitet mit den Inhalten, die du gerade gepflegt
                hast. Du gestaltest die Darstellung, ohne dieselben Daten noch
                einmal einzutippen.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    n: "01",
                    title: "Theme wählen",
                    text: "Das Theme legt Gesamtwirkung, Flächen, Typografie und Anordnung fest.",
                  },
                  {
                    n: "02",
                    title: "Seite auswählen",
                    text: "Bearbeite Startseite und Unterseiten getrennt, aber im selben Design.",
                  },
                  {
                    n: "03",
                    title: "Module anordnen",
                    text: "Ziehe Klassen, Fuhrpark und Kontakt an die passende Stelle. Die Inhalte kommen aus deiner Verwaltung.",
                  },
                  {
                    n: "04",
                    title: "Vorschau & Veröffentlichung",
                    text: "Prüfe mobil und am Desktop. Erst dein bewusster Klick veröffentlicht Änderungen.",
                  },
                ].map((item) => (
                  <div
                    className="flex gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5"
                    key={item.n}
                  >
                    <span className="text-sm font-semibold text-cyan-700">
                      {item.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form action={startBuilderFromGuideAction} className="mt-8">
                <GuidedSubmitButton className="min-h-12 w-full rounded-xl bg-slate-950 px-6 font-semibold text-white sm:w-auto">
                  Builder öffnen und Seite gestalten →
                </GuidedSubmitButton>
              </form>
            </div>
          ) : null}

          <span className="sr-only">
            Schritt {progressIndex + 1} von {stepKeys.length}
          </span>
        </main>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input
        className={`${inputClass} mt-2`}
        defaultValue={defaultValue ?? ""}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function WizardButtons({
  back,
  nextLabel,
}: {
  back: StepKey;
  nextLabel: string;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold"
        href={`/kunde/einrichtung?schritt=${back}`}
      >
        ← Zurück
      </Link>
      <GuidedSubmitButton className="min-h-11 rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white">
        {nextLabel} →
      </GuidedSubmitButton>
    </div>
  );
}

function SetupLink({
  done,
  href,
  title,
  text,
}: {
  done: boolean;
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      className="group rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-400 hover:shadow-md"
      href={href}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          {done ? "Erledigt" : "Öffnen"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <span className="mt-4 block text-sm font-semibold text-cyan-700">
        Bearbeiten →
      </span>
    </Link>
  );
}
