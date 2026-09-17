import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
const tasks = [
  [
    "Seiten & Blöcke",
    "Startseite, Unterseiten, Vorschau und Veröffentlichung",
    "/kunde/website/builder",
  ],
  [
    "Navigation",
    "Reihenfolge und sichtbare Menüpunkte bearbeiten",
    "/kunde/website/builder",
  ],
  [
    "Theme",
    "Freigegebene Farben, Schriftvariante und Logo wählen",
    "/kunde/website/builder",
  ],
  ["Domainstatus", "Verifikation und SSL-Hinweise prüfen", "/kunde/domain"],
  [
    "Rechtliches & Consent",
    "Texte und technische Einwilligungen verwalten",
    "/kunde/rechtliches",
  ],
] as const;
export default function WebsiteOverviewPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Website" },
        ]}
      />
      <h1 className="mt-6 text-3xl font-semibold">Website verwalten</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Alle öffentlichen Website-Einstellungen an einem Ort.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {tasks.map(([title, description, href]) => (
          <Card key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-slate-600">{description}</p>
            <Link
              className="mt-5 inline-block font-semibold text-cyan-800"
              href={href}
            >
              Öffnen
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
