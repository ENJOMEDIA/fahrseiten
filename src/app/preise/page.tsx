import Link from "next/link";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { marketingPlans } from "@/config/marketing";
export default function PricingPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Preise"
      title="Ein klarer Rahmen – Konditionen noch in Abstimmung."
      text="Die endgültigen Einrichtungs- und Monatspreise sind eine offene Geschäftsentscheidung und werden hier nicht erfunden."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {marketingPlans.map((plan) => (
          <article className="rounded-3xl border bg-white p-8" key={plan.key}>
            <p className="text-sm font-semibold text-cyan-700">
              {plan.available ? "MVP-Angebot" : "In Planung"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-4 text-slate-600">{plan.description}</p>
            <p className="mt-6 text-xl font-semibold">
              {plan.price ?? "Preis wird festgelegt"}
            </p>
            {plan.available ? (
              <Link
                className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
                href="/kontakt"
              >
                Beratung anfragen
              </Link>
            ) : (
              <p className="mt-6 text-sm text-slate-500">Noch nicht buchbar</p>
            )}
          </article>
        ))}
      </div>
    </SimpleMarketingPage>
  );
}
