import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";

export function TableContainer(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="overflow-x-auto rounded-[var(--radius-card)] border border-slate-200"
      {...props}
    />
  );
}
export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className="w-full border-collapse text-left text-sm" {...props} />
  );
}
export function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="bg-slate-50 px-4 py-3 font-semibold text-slate-700"
      scope="col"
      {...props}
    />
  );
}
export function Td(props: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="border-t border-slate-200 px-4 py-3" {...props} />;
}
