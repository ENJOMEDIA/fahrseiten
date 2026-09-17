"use client";

import { useActionState } from "react";

import {
  uploadPlatformBrandAsset,
  type BrandAssetActionState,
} from "./branding-actions";

const initialState: BrandAssetActionState = { message: "", error: false };

export function BrandingUploadForm({ kind }: { kind: "logo" | "favicon" }) {
  const [state, action, pending] = useActionState(
    uploadPlatformBrandAsset,
    initialState,
  );
  const favicon = kind === "favicon";
  return (
    <form action={action} className="mt-5 space-y-4">
      <input name="kind" type="hidden" value={kind} />
      <input
        accept={
          favicon
            ? ".ico,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/png,image/jpeg,image/webp"
            : "image/svg+xml,image/png,image/jpeg,image/webp"
        }
        className="block w-full text-sm"
        name="file"
        required
        type="file"
      />
      <button
        className={`w-full rounded-xl px-4 py-3 font-semibold disabled:cursor-wait disabled:opacity-50 ${favicon ? "border border-slate-300" : "bg-slate-950 text-white"}`}
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Wird hochgeladen …"
          : favicon
            ? "Favicon hochladen"
            : "Seitenlogo hochladen"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
