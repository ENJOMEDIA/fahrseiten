import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-lg bg-slate-200", className)}
    />
  );
}

export function Toast({
  title,
  description,
  tone = "info",
}: {
  title: string;
  description: string;
  tone?: "info" | "success" | "error";
}) {
  const styles = {
    info: "border-cyan-200",
    success: "border-emerald-200",
    error: "border-red-200",
  };
  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("rounded-xl border bg-white p-4 shadow-lg", styles[tone])}
      role={tone === "error" ? "alert" : "status"}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
