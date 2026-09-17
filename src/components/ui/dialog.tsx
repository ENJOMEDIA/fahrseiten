"use client";

import { useRef } from "react";

import { Button } from "./button";

export function DialogExample() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button onClick={() => dialog.current?.showModal()} variant="secondary">
        Dialog öffnen
      </Button>
      <dialog
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-[var(--radius-card)] p-0 shadow-2xl backdrop:bg-slate-950/50"
        ref={dialog}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold">Änderung bestätigen</h2>
          <p className="mt-3 text-slate-600">
            Dialoge erklären Wirkung und nächsten Schritt in klarer Sprache.
          </p>
          <form className="mt-6 flex justify-end" method="dialog">
            <Button variant="secondary">Schließen</Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
