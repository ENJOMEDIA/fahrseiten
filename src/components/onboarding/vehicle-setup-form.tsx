"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import {
  createContentEntryAction,
  type ContentActionState,
  updateContentEntryAction,
} from "@/app/kunde/inhalte/[module]/actions";

const initialState: ContentActionState = { message: "", error: false };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

type Vehicle = {
  id: string;
  name: string;
  category: string;
  transmission: "manual" | "automatic";
  description: string | null;
  imageMediaId: string | null;
  imageUrl?: string;
};

export function VehicleSetupForm({
  classes,
  heading,
  media,
  vehicle,
}: {
  classes: { key: string; title: string }[];
  heading?: string;
  media: { id: string; label: string }[];
  vehicle?: Vehicle;
}) {
  const defaultClasses =
    vehicle?.category
      .split(",")
      .map((entry) => entry.trim().replace(/^Klasse\s+/i, ""))
      .filter((entry) => classes.some((item) => item.key === entry)) ?? [];
  const [selectedClasses, setSelectedClasses] = useState(defaultClasses);
  const formRef = useRef<HTMLFormElement>(null);
  const serverAction = vehicle
    ? updateContentEntryAction
    : createContentEntryAction;
  const [state, action, pending] = useActionState(
    async (previousState: ContentActionState, formData: FormData) => {
      const result = await serverAction(previousState, formData);
      if (!vehicle && !result.error) {
        formRef.current?.reset();
        setSelectedClasses([]);
      }
      return result;
    },
    initialState,
  );

  return (
    <form
      action={action}
      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-6"
      encType="multipart/form-data"
      ref={formRef}
    >
      <input name="module" type="hidden" value="fahrzeuge" />
      <input name="category" type="hidden" value={selectedClasses.join(", ")} />
      {vehicle ? <input name="id" type="hidden" value={vehicle.id} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-950">
            {vehicle ? vehicle.name : (heading ?? "Fahrzeug hinzufügen")}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Klassen auswählen, Fahrzeug beschreiben und optional direkt ein Foto
            hinzufügen.
          </p>
        </div>
        {vehicle?.imageUrl ? (
          <Image
            alt={vehicle.name}
            className="h-20 w-full rounded-xl object-cover sm:w-32"
            height={80}
            src={vehicle.imageUrl}
            unoptimized
            width={128}
          />
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Modell oder Bezeichnung
          <input
            className={fieldClass}
            defaultValue={vehicle?.name}
            name="title"
            placeholder="z. B. VW Golf 8"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Getriebe
          <select
            className={fieldClass}
            defaultValue={vehicle?.transmission ?? "manual"}
            name="transmission"
          >
            <option value="manual">Schaltung</option>
            <option value="automatic">Automatik</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-slate-700">
          Für welche Führerscheinklassen wird es eingesetzt?
        </legend>
        {classes.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {classes.map((item) => {
              const selected = selectedClasses.includes(item.key);
              return (
                <label
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition ${selected ? "border-cyan-500 bg-cyan-50 text-cyan-900" : "border-slate-300 bg-white text-slate-600"}`}
                  key={item.key}
                >
                  <input
                    checked={selected}
                    className="mr-2 accent-cyan-600"
                    onChange={(event) =>
                      setSelectedClasses((current) =>
                        event.target.checked
                          ? [...current, item.key]
                          : current.filter((entry) => entry !== item.key),
                      )
                    }
                    type="checkbox"
                  />
                  {item.title}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Lege zuerst mindestens eine Führerscheinklasse in Schritt 1 fest.
          </p>
        )}
      </fieldset>

      <label className="mt-5 block text-sm font-semibold text-slate-700">
        Kurze Beschreibung
        <textarea
          className={`${fieldClass} min-h-24 p-3`}
          defaultValue={vehicle?.description ?? ""}
          name="description"
          placeholder="z. B. modern, kompakt und leicht zu fahren"
        />
      </label>

      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Vorhandenes Foto auswählen
          <select
            className={fieldClass}
            defaultValue={vehicle?.imageMediaId ?? ""}
            name="imageMediaId"
          >
            <option value="">Kein Foto verwenden</option>
            {media.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Oder neues Foto hochladen
          <input
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="mt-3 block w-full text-sm font-normal"
            name="imageFile"
            type="file"
          />
          <span className="mt-2 block text-xs leading-5 font-normal text-slate-500">
            Optional. PNG, JPG, WebP oder SVG bis 8 MB. Das Bild wird dem
            Fuhrpark zugeordnet und optimiert.
          </span>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Bildbeschreibung für Barrierefreiheit
          <input
            className={fieldClass}
            name="imageAlt"
            placeholder={`z. B. ${vehicle?.name ?? "Fahrschulfahrzeug"} vor dem Standort`}
          />
        </label>
      </div>

      {!selectedClasses.length ? (
        <p className="mt-4 text-sm font-semibold text-amber-800">
          Bitte mindestens eine der angebotenen Klassen auswählen.
        </p>
      ) : null}
      <button
        className="mt-5 min-h-11 w-full rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={pending || selectedClasses.length === 0}
        type="submit"
      >
        {pending
          ? "Wird gespeichert …"
          : vehicle
            ? "Fahrzeug aktualisieren"
            : "+ Fahrzeug speichern"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
