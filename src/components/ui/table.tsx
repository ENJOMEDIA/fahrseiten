import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

export function TableContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-full overflow-x-auto overscroll-x-contain rounded-[var(--radius-card)] border border-slate-200",
        className,
      )}
      tabIndex={0}
      {...props}
    />
  );
}
export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
      {...props}
    />
  );
}
export function Th({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "bg-slate-50 px-4 py-3 font-semibold text-slate-700",
        className,
      )}
      scope="col"
      {...props}
    />
  );
}
export function Td({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border-t border-slate-200 px-4 py-3", className)}
      {...props}
    />
  );
}
