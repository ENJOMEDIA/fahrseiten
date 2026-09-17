import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import {
  availableMarketingFeatures,
  plannedMarketingFeatures,
} from "@/config/marketing";
export default function FeaturesPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Funktionen"
      title="Alles für eine überzeugende Fahrschulwebsite."
      text="Strukturierte Inhalte, ein kontrollierter Builder und klare Kundenabläufe – mit ehrlich gekennzeichnetem Produktstand."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-semibold">Im MVP verfügbar</h2>
          <ul className="mt-5 space-y-4">
            {availableMarketingFeatures.map((item) => (
              <li className="rounded-2xl border bg-white p-4" key={item}>
                ✓ {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">In Planung</h2>
          <ul className="mt-5 space-y-4">
            {plannedMarketingFeatures.map((item) => (
              <li
                className="rounded-2xl bg-slate-100 p-4 text-slate-600"
                key={item}
              >
                In Planung · {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SimpleMarketingPage>
  );
}
