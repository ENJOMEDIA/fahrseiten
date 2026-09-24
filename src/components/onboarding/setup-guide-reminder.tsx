"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  dismissSetupReminderAction,
  recordSetupReminderAction,
} from "@/app/kunde/einrichtung/actions";

export function SetupGuideReminder({ percent }: { percent: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(pathname !== "/kunde/einrichtung");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(() => void recordSetupReminderAction());
  }, [open]);

  if (!open) return null;
  return (
    <aside className="fixed right-3 bottom-3 z-50 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-[1.75rem] border border-cyan-200 bg-white shadow-2xl shadow-slate-900/20 sm:right-6 sm:bottom-6">
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-cyan-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-xl"
            aria-hidden="true"
          >
            ✓
          </span>
          <button
            className="rounded-full px-2 text-xl text-slate-400 hover:bg-slate-100"
            onClick={() => setOpen(false)}
            type="button"
            aria-label="Hinweis schließen"
          >
            ×
          </button>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
          Geführter Start · {percent}%
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Erst Inhalte, dann gestalten.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Wir führen dich durch Klassen, Öffnungszeiten und Fahrzeuge. Danach
          setzt du alles im Builder mit wenigen Klicks zusammen.
        </p>
        <Link
          className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
          href="/kunde/einrichtung"
          onClick={() => setOpen(false)}
        >
          Einrichtung fortsetzen →
        </Link>
        <form action={dismissSetupReminderAction} className="mt-2">
          <button
            className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            type="submit"
          >
            Nicht wieder anzeigen
          </button>
        </form>
      </div>
    </aside>
  );
}
