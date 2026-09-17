import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { contentModules } from "@/modules/customer/navigation";
export default function ContentOverviewPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Inhalte" },
        ]}
      />
      <h1 className="mt-6 text-3xl font-semibold">Fahrschulinhalte</h1>
      <p className="mt-3 text-slate-600">
        Pflege strukturierte Inhalte, die du anschließend als Blöcke auf Seiten
        einsetzt.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(contentModules).map(([slug, module]) => (
          <Card key={slug}>
            <h2 className="text-xl font-semibold">{module.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Sortieren, aktivieren und bearbeiten.
            </p>
            <Link
              className="mt-5 inline-block font-semibold text-cyan-800"
              href={`/kunde/inhalte/${slug}`}
            >
              Verwalten
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
