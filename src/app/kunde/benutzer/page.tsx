import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";

export default async function UsersPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  return (
    <CustomerPage
      title="Benutzer & Rollen"
      description="Zugriffe gelten ausschließlich für diesen Mandanten und werden serverseitig geprüft."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Dein aktiver Zugang</h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-slate-500">Name</dt>
            <dd>{identity?.displayName ?? "Nicht verfügbar"}</dd>
            <dt className="text-slate-500">Rolle</dt>
            <dd>{membership?.role ?? "Keine Mandantenrolle"}</dd>
            <dt className="text-slate-500">E-Mail</dt>
            <dd>{identity?.email ?? "Nicht verfügbar"}</dd>
          </dl>
        </Card>
        <Card>
          <h2 className="font-semibold">Weitere Teamzugänge</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Zusätzliche Editoren und Betrachter werden erst angeboten, sobald
            der Einladungs- und E-Mail-Ablauf vollständig freigegeben ist. Bis
            dahin werden hier keine scheinbar funktionierenden Einladungen
            erzeugt.
          </p>
        </Card>
      </div>
    </CustomerPage>
  );
}
