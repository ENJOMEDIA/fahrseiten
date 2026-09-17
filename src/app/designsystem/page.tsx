import { Breadcrumbs } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/card";
import { DialogExample } from "@/components/ui/dialog";
import { EmptyState, Skeleton, Toast } from "@/components/ui/feedback";
import { Checkbox, Input, Select } from "@/components/ui/field";
import { Table, TableContainer, Td, Th } from "@/components/ui/table";

export default function DesignSystemPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <Breadcrumbs
        items={[{ label: "Start", href: "/" }, { label: "Designsystem" }]}
      />
      <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
        Interne Übersicht
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Ruhig, klar und belastbar.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Gemeinsame Komponenten für Marketing, Plattform, Kundenverwaltung und
        Tenant-Websites.
      </p>

      <section
        className="mt-12 grid gap-6 md:grid-cols-2"
        aria-labelledby="actions-heading"
      >
        <Card>
          <h2 className="text-xl font-semibold" id="actions-heading">
            Aktionen und Status
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button>Speichern</Button>
            <Button variant="secondary">Vorschau</Button>
            <Button variant="quiet">Abbrechen</Button>
            <Button variant="danger">Entfernen</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge tone="success">Veröffentlicht</StatusBadge>
            <StatusBadge tone="warning">Entwurf</StatusBadge>
            <StatusBadge tone="info">In Planung</StatusBadge>
            <StatusBadge tone="danger">Fehler</StatusBadge>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Formularfelder</h2>
          <div className="mt-5 grid gap-4">
            <Input
              hint="Wird in der Seitennavigation angezeigt."
              label="Seitentitel"
              name="title"
              placeholder="Startseite"
            />
            <Select label="Status" name="status">
              <option>Entwurf</option>
              <option>Veröffentlicht</option>
            </Select>
            <Checkbox label="In Navigation anzeigen" name="navigation" />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Dialog und Nachricht</h2>
          <div className="mt-5">
            <DialogExample />
          </div>
          <div className="mt-5">
            <Toast
              description="Die Entwurfsversion wurde gesichert."
              title="Gespeichert"
              tone="success"
            />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Ladezustand</h2>
          <div className="mt-5 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </Card>
      </section>

      <section className="mt-6" aria-labelledby="table-heading">
        <h2 className="sr-only" id="table-heading">
          Tabelle
        </h2>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Bereich</Th>
                <Th>Status</Th>
                <Th>Hinweis</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>Website</Td>
                <Td>
                  <StatusBadge tone="success">Aktiv</StatusBadge>
                </Td>
                <Td>Veröffentlicht</Td>
              </tr>
              <tr>
                <Td>Domain</Td>
                <Td>
                  <StatusBadge tone="warning">Prüfung</StatusBadge>
                </Td>
                <Td>DNS-Nachweis fehlt</Td>
              </tr>
            </tbody>
          </Table>
        </TableContainer>
      </section>
      <section className="mt-6">
        <EmptyState
          action={<Button>Ersten Eintrag anlegen</Button>}
          description="Sobald Inhalte vorhanden sind, erscheinen sie an dieser Stelle."
          title="Noch keine Einträge"
        />
      </section>
    </main>
  );
}
