"use client";

import { useEffect, useRef, useState } from "react";

export type AutoSaveResult = { message: string; error: boolean };
type AutoSavePhase = "idle" | "countdown" | "saving" | "saved" | "error";
type AutoSaveEvent = {
  sourceId: string;
  phase: AutoSavePhase;
  countdown: number | null;
  message?: string;
};

const eventName = "fahrseiten:auto-save";

function announce(detail: AutoSaveEvent) {
  window.dispatchEvent(new CustomEvent<AutoSaveEvent>(eventName, { detail }));
}

export function AutoSaveIndicator() {
  const [status, setStatus] = useState<AutoSaveEvent>({
    sourceId: "",
    phase: "idle",
    countdown: null,
  });

  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<AutoSaveEvent>).detail;
      setStatus((current) =>
        detail.phase === "idle" && detail.sourceId !== current.sourceId
          ? current
          : detail,
      );
    };
    window.addEventListener(eventName, receive);
    return () => window.removeEventListener(eventName, receive);
  }, []);

  if (status.phase === "idle") return null;
  const error = status.phase === "error";
  const label =
    status.phase === "countdown"
      ? `Speichern in ${status.countdown} …`
      : status.phase === "saving"
        ? "Änderungen werden gespeichert …"
        : status.phase === "saved"
          ? "Alle Änderungen gespeichert"
          : status.message || "Automatisches Speichern fehlgeschlagen";

  return (
    <div
      aria-live="polite"
      className={`fixed top-0 left-1/2 z-[100] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-0 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl ${error ? "border-red-400" : "border-cyan-300/40"}`}
    >
      <div className="flex items-center justify-center gap-3">
        <span
          className={`size-2.5 rounded-full ${error ? "bg-red-400" : status.phase === "saved" ? "bg-emerald-400" : "animate-pulse bg-cyan-300"}`}
        />
        <span>{label}</span>
      </div>
      {status.phase === "countdown" && status.countdown !== null ? (
        <span className="absolute right-0 bottom-0 left-0 h-1 bg-white/15">
          <span
            className="block h-full bg-cyan-300 transition-[width] duration-1000 ease-linear"
            style={{ width: `${((5 - status.countdown) / 5) * 100}%` }}
          />
        </span>
      ) : null}
    </div>
  );
}

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
  const resultAtSubmit = useRef(result);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [localError, setLocalError] = useState("");
  const [phase, setPhase] = useState<AutoSavePhase>("idle");

  useEffect(() => {
    announce({
      sourceId: formId,
      phase,
      countdown,
      message: localError || result.message,
    });
  }, [countdown, formId, localError, phase, result.message]);

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
        window.setTimeout(() => setPhase("idle"), 4_000);
        return;
      }
      setPhase("saving");
      triggered.current = true;
      sawPending.current = false;
      resultAtSubmit.current = result;
      button.click();
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown, enabled, formId, pending, result]);

  useEffect(() => {
    if (!triggered.current) return;
    if (pending) {
      sawPending.current = true;
      return;
    }
    if (!sawPending.current && result === resultAtSubmit.current) return;
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
      setPhase("saving");
      triggered.current = true;
      sawPending.current = pending;
      resultAtSubmit.current = result;
    },
    indicator: null,
  };
}
