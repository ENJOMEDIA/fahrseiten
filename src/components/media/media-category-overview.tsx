import type { MediaCategory } from "@/modules/media/service";
import { mediaCategoryLabels } from "@/modules/media/service";

export function MediaCategoryOverview({
  categories,
  counts,
}: {
  categories: readonly MediaCategory[];
  counts: Partial<Record<MediaCategory, number>>;
}) {
  return (
    <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold tracking-[.16em] text-cyan-700 uppercase">
          Medienbereiche
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          Dateien gezielt ablegen und wiederfinden
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Wähle beim Upload den passenden Bereich oder verschiebe vorhandene
          Medien direkt an der Datei.
        </p>
      </div>
      <nav
        aria-label="Medienkategorien"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {categories.map((category) => (
          <a
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-cyan-300 hover:bg-cyan-50"
            href={`#media-${category}`}
            key={category}
          >
            <span className="text-sm font-semibold">
              {mediaCategoryLabels[category]}
            </span>
            <span className="grid min-w-7 place-items-center rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {counts[category] ?? 0}
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}
