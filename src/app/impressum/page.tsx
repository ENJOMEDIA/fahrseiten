import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

export default async function ImprintPage() {
  await connection();
  const settings = await findPlatformSettings();
  return (
    <SimpleMarketingPage
      eyebrow="Rechtliches"
      title="Impressum"
      text="Redaktioneller Platzhalter – vor Veröffentlichung rechtlich und inhaltlich zu vervollständigen."
    >
      {settings ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 leading-7">
          <p className="font-semibold">{settings.companyName}</p>
          <p>Vertreten durch {settings.ownerName}</p>
          <address className="mt-3 not-italic">
            {settings.street}
            <br />
            {settings.postalCode} {settings.city}
          </address>
          <p className="mt-3">E-Mail: {settings.contactEmail}</p>
          {settings.phone ? <p>Telefon: {settings.phone}</p> : null}
          <p className="mt-5 text-sm text-amber-800">
            Register-, Steuer- und weitere Pflichtangaben müssen vor
            Veröffentlichung rechtlich ergänzt und geprüft werden.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="font-semibold">Noch nicht eingerichtet</h2>
          <p className="mt-3 text-slate-700">
            Anbieter- und Kontaktangaben werden beim FahrSeiten-Setup
            hinterlegt. Rechtliche Pflichtangaben benötigen anschließend eine
            Prüfung.
          </p>
        </div>
      )}
    </SimpleMarketingPage>
  );
}
