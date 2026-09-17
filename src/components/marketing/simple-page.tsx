import { MarketingHero, MarketingShell } from "./marketing-shell";
export function SimpleMarketingPage({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingShell>
      <main>
        <MarketingHero eyebrow={eyebrow} title={title} text={text} />
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">{children}</div>
        </section>
      </main>
    </MarketingShell>
  );
}
