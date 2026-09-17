import Link from "next/link";

export function SalesNav() {
  return (
    <nav
      aria-label="Akquise-Bereiche"
      className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2"
    >
      {[
        ["/admin/akquise", "Pipeline"],
        ["/admin/akquise/kontakte", "Kontakte & CSV"],
        ["/admin/akquise/vorlagen", "E-Mail-Vorlagen"],
      ].map(([href, label]) => (
        <Link
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-900"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
