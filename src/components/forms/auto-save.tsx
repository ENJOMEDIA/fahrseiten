"use client";

import { useEffect, useRef, useState } from "react";

export type AutoSaveResult = { message: string; error: boolean };

export function useAutoSave({
  enabled = true,
  formId,
  pending,
  result,
}: {
  enabled?: boolean;
  formId: string;
  pending: boolean;
  result: AutoSaveResult;
}) {
  const triggered = useRef(false);
  const sawPending = useRef(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [localError, setLocalError] = useState("");
  const [phase, setPhase] = useState<
    "idle" | "countdown" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    if (!enabled || countdown === null || pending) return;
    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
        return;
      }
      setCountdown(null);
      const form = document.getElementById(formId) as HTMLFormElement | null;
      const button = form?.querySelector<HTMLButtonElement>(
        "[data-auto-save-submit]",
      );
      if (!form || !button || !form.checkValidity()) {
        setLocalError(
          "Automatisches Speichern wartet auf gültige Pflichtangaben.",
        );
        setPhase("error");
        return;
      }
      setPhase("saving");
      triggered.current = true;
      sawPending.current = false;
      button.click();
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown, enabled, formId, pending]);

  useEffect(() => {
    if (!triggered.current) return;
    if (pending) {
      sawPending.current = true;
      return;
    }
    if (!sawPending.current) return;
    triggered.current = false;
    sawPending.current = false;
    setPhase(result.error ? "error" : "saved");
    const timer = window.setTimeout(() => setPhase("idle"), 3_000);
    return () => window.clearTimeout(timer);
  }, [pending, result]);

  return {
    onChange() {
      if (!enabled) return;
      setLocalError("");
      setCountdown(5);
      setPhase("countdown");
    },
    onSubmit() {
      setCountdown(null);
    },
    indicator:
      phase === "idle" ? null : (
        <div
          aria-live="polite"
          className={`fixed top-24 right-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-2xl transition ${
            phase === "error" ? "border-red-400" : "border-cyan-300/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`size-2.5 rounded-full ${
                phase === "error"
                  ? "bg-red-400"
                  : phase === "saved"
                    ? "bg-emerald-400"
                    : "animate-pulse bg-cyan-300"
              }`}
            />
            <span>
              {phase === "countdown"
                ? `Automatisches Speichern in ${countdown} …`
                : phase === "saving"
                  ? "Änderungen werden gespeichert …"
                  : phase === "saved"
                    ? "Änderungen automatisch gespeichert"
                    : localError ||
                      result.message ||
                      "Automatisches Speichern fehlgeschlagen"}
            </span>
          </div>
          {phase === "countdown" && countdown !== null ? (
            <span className="mt-3 block h-1 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full rounded-full bg-cyan-300 transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </span>
          ) : null}
        </div>
      ),
  };
}
