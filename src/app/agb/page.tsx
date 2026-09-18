import { connection } from "next/server";

import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { LegalContent } from "@/modules/legal/public-document";
import { findPublishedPlatformLegalDocument } from "@/modules/legal/repository";

export default async function TermsPage() {
  await connection();
  const document = await findPublishedPlatformLegalDocument("terms").catch(
    () => null,
  );
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Rechtliches"
      title="Allgemeine Geschäftsbedingungen"
      text="Vertragsbedingungen für die Nutzung und Betreuung von FahrSeiten."
    >
      {document ? (
        <article className="rounded-3xl border bg-white p-8">
          <LegalContent
            content={document.content}
            title="Allgemeine Geschäftsbedingungen"
          />
        </article>
      ) : (
        <article className="rounded-3xl border border-amber-300 bg-amber-50 p-8">
          <h2 className="text-xl font-semibold">Noch nicht veröffentlicht</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Die Vertragsbedingungen werden derzeit fachlich und rechtlich
            geprüft. Ein Vertragsschluss über diese Seite findet noch nicht
            statt.
          </p>
        </article>
      )}
    </SimpleMarketingPage>
  );
}
