import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type FieldBase = { label: string; hint?: string; error?: string };

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? props.name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-slate-800"
        htmlFor={fieldId}
      >
        {label}
      </label>
      <input
        aria-describedby={hint || error ? descriptionId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-11 w-full rounded-[var(--radius-control)] border bg-white px-3 text-slate-950 shadow-xs",
          error ? "border-red-500" : "border-slate-300",
          className,
        )}
        id={fieldId}
        {...props}
      />
      {hint || error ? (
        <p
          className={cn(
            "mt-2 text-sm",
            error ? "text-red-700" : "text-slate-500",
          )}
          id={descriptionId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  const fieldId = id ?? props.name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-slate-800"
        htmlFor={fieldId}
      >
        {label}
      </label>
      <select
        aria-describedby={hint || error ? descriptionId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-11 w-full rounded-[var(--radius-control)] border bg-white px-3 text-slate-950 shadow-xs",
          error ? "border-red-500" : "border-slate-300",
          className,
        )}
        id={fieldId}
        {...props}
      >
        {children}
      </select>
      {hint || error ? (
        <p
          className={cn(
            "mt-2 text-sm",
            error ? "text-red-700" : "text-slate-500",
          )}
          id={descriptionId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  label,
  className,
  id,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? props.name;
  return (
    <label
      className="flex min-h-11 items-center gap-3 text-sm font-medium"
      htmlFor={fieldId}
    >
      <input
        className={cn(
          "size-5 rounded border-slate-300 accent-cyan-600",
          className,
        )}
        id={fieldId}
        type="checkbox"
        {...props}
      />
      {label}
    </label>
  );
}
