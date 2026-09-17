import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
export default function MediaPage() {
  return (
    <CustomerPage
      title="Medien"
      description="Geprüfte Bilder des aktuellen Mandanten auswählen, ersetzen oder archivieren."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Card>
          <h2 className="font-semibold">Medienbibliothek</h2>
          <p className="mt-3 text-slate-600">Noch keine Bilder hochgeladen.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Bild hochladen</h2>
          <form className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Bilddatei
              <input
                accept="image/png,image/jpeg,image/webp"
                className="mt-2 block w-full"
                type="file"
              />
            </label>
            <label className="block text-sm font-semibold">
              Alt-Text
              <input className="mt-2 w-full rounded-xl border p-3" />
            </label>
            <button
              className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              type="button"
            >
              Sicher prüfen und hochladen
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            PNG, JPEG oder WebP · maximal 8 MB
          </p>
        </Card>
      </div>
    </CustomerPage>
  );
}
