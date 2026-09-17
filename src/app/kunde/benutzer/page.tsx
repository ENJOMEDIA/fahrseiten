import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
export default function UsersPage() {
  return (
    <CustomerPage
      title="Benutzer & Rollen"
      description="Zugriffe gelten ausschließlich für diesen Mandanten und werden serverseitig geprüft."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Aktive Demo-Mitgliedschaft</h2>
          <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-2 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd>Mara Beispiel</dd>
            <dt className="text-slate-500">Rolle</dt>
            <dd>tenant_owner</dd>
            <dt className="text-slate-500">E-Mail</dt>
            <dd>inhaber@morgenrot.local</dd>
          </dl>
        </Card>
        <Card>
          <h2 className="font-semibold">Benutzer einladen</h2>
          <form className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              E-Mail-Adresse
              <input
                className="mt-2 w-full rounded-xl border p-3"
                type="email"
              />
            </label>
            <label className="block text-sm font-semibold">
              Rolle
              <select className="mt-2 w-full rounded-xl border p-3">
                <option>Editor</option>
                <option>Betrachter</option>
              </select>
            </label>
            <button
              className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              type="button"
            >
              Einladung vorbereiten
            </button>
          </form>
        </Card>
      </div>
    </CustomerPage>
  );
}
