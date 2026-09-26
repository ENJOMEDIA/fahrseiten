import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
import { findPublishedPlatformLegalDocument } from "@/modules/legal/repository";
import { LegalContent } from "@/modules/legal/public-document";

export default async function ImprintPage() {
  await connection();
  const [settings, document] = await Promise.all([
    findPlatformSettings(),
    findPublishedPlatformLegalDocument("imprint").catch(() => null),
  ]);
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Rechtliches"
      title="Impressum"
      text="Anbieterkennzeichnung und Kontaktinformationen der FahrSeiten-Plattform."
    >
      {document ? (
        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <LegalContent content={document.content} title="Impressum" />
        </article>
      ) : settings ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 leading-7 shadow-sm sm:p-8 lg:p-10">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">Anbieter</h2>
            <p className="mt-2 text-slate-700">{settings.companyName}</p>
            <p className="text-slate-700">
              Vertreten durch {settings.ownerName}
            </p>
          </section>
          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className="text-lg font-semibold text-slate-950">Anschrift</h2>
            <address className="mt-2 text-slate-700 not-italic">
              {settings.street}
              <br />
              {settings.postalCode} {settings.city}
            </address>
          </section>
          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className="text-lg font-semibold text-slate-950">Kontakt</h2>
            <p className="mt-2 text-slate-700">
              E-Mail: {settings.contactEmail}
            </p>
            {settings.phone ? (
              <p className="text-slate-700">Telefon: {settings.phone}</p>
            ) : null}
          </section>
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
