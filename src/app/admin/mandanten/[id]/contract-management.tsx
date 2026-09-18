"use client";

import { useActionState } from "react";

import {
  prepareContractAction,
  sendContractForSignatureAction,
  type DomainActionState,
} from "./actions";

const initialState: DomainActionState = { message: "", error: false };

function Feedback({ state }: { state: DomainActionState }) {
  return state.message ? (
    <p
      className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function PrepareContractForm({ tenantId }: { tenantId: string }) {
  const [state, action, pending] = useActionState(
    prepareContractAction,
    initialState,
  );
  return (
    <form action={action} className="mt-5">
      <input name="tenantId" type="hidden" value={tenantId} />
      <button className="premium-button" disabled={pending}>
        {pending
          ? "Vertrag wird fixiert …"
          : "Vertrag zur Signatur vorbereiten"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function SendContractForm({
  tenantId,
  documentId,
}: {
  tenantId: string;
  documentId: string;
}) {
  const [state, action, pending] = useActionState(
    sendContractForSignatureAction,
    initialState,
  );
  return (
    <form action={action}>
      <input name="tenantId" type="hidden" value={tenantId} />
      <input name="documentId" type="hidden" value={documentId} />
      <button
        className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Wird übergeben …" : "Zur Signatur senden"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
