import { CustomerPage } from "@/components/customer/customer-page";
import { logoutAction } from "@/modules/auth/actions";
export default function SettingsPage() {
  return (
    <CustomerPage
      title="Allgemeine Einstellungen"
      description="Grunddaten gelten ausschließlich für den aktuellen Mandanten."
    >
      <form className="max-w-2xl space-y-5 rounded-2xl border bg-white p-6">
        <label className="block text-sm font-semibold">
          Anzeigename
          <input
            className="mt-2 w-full rounded-xl border p-3"
            defaultValue="Fahrschule Morgenrot (Demo)"
          />
        </label>
        <label className="block text-sm font-semibold">
          Zeitzone
          <select
            className="mt-2 w-full rounded-xl border p-3"
            defaultValue="Europe/Berlin"
          >
            <option>Europe/Berlin</option>
          </select>
        </label>
        <button
          className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
          type="button"
        >
          Einstellungen speichern
        </button>
      </form>
      <form action={logoutAction} className="mt-8">
        <button
          className="rounded-xl border bg-white px-4 py-3 font-semibold"
          type="submit"
        >
          Abmelden
        </button>
      </form>
    </CustomerPage>
  );
}
