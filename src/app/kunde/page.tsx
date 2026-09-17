import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card, StatusBadge as Badge } from "@/components/ui/card";

export default function CustomerDashboardPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Kundenbereich" }, { label: "Dashboard" }]}
      />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Fiktiver Demo-Mandant
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Guten Morgen</h1>
        </div>
        <Link
          className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
          href="/kunde/website/builder"
        >
          Website bearbeiten
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Veröffentlichung</h2>
            <Badge tone="success">Veröffentlicht</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Die Demo-Startseite hat einen veröffentlichten Stand.
          </p>
          <Link
            className="mt-4 inline-block font-semibold text-cyan-800"
            href="/kunde/website"
          >
            Website verwalten
          </Link>
        </Card>
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Anfragen</h2>
            <Badge>Keine neuen</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Für den lokalen Demo-Mandanten liegen keine Testanfragen vor.
          </p>
          <Link
            className="mt-4 inline-block font-semibold text-cyan-800"
            href="/kunde/anfragen"
          >
            Anfragen öffnen
          </Link>
        </Card>
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Domain & SSL</h2>
            <Badge tone="success">Lokale Demo aktiv</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Keine echte Domain oder externes Zertifikat wurde eingerichtet.
          </p>
          <Link
            className="mt-4 inline-block font-semibold text-cyan-800"
            href="/kunde/domain"
          >
            Status ansehen
          </Link>
        </Card>
        <Card>
          <h2 className="font-semibold">Letzte Änderungen</h2>
          <p className="mt-3 text-sm text-slate-600">
            Noch keine gespeicherten Änderungen in dieser lokalen Sitzung.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">Pflichtangaben</h2>
          <p className="mt-3 text-sm text-slate-600">
            Rechtstexte benötigen vor einer Veröffentlichung eine fachliche und
            rechtliche Prüfung.
          </p>
          <Link
            className="mt-4 inline-block font-semibold text-cyan-800"
            href="/kunde/rechtliches"
          >
            Rechtliches prüfen
          </Link>
        </Card>
        <Card>
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">Fahrstundenplanung</h2>
            <Badge>In Planung</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Diese Funktion gehört nicht zum ersten MVP.
          </p>
        </Card>
      </div>
    </>
  );
}
