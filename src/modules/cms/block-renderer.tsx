import Image from "next/image";
import Link from "next/link";

import type { StoredBlock } from "./block-schema";

const weekdays = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function BlockRenderer({
  blocks,
  contactHref,
}: {
  blocks: readonly StoredBlock[];
  contactHref?: string;
}) {
  const contactBlockId = blocks.find(
    (block) => block.visible && block.properties.type === "contact_teaser",
  )?.id;
  return (
    <div className="@container">
      {blocks
        .filter((block) => block.visible)
        .map((block, index) => (
          <Block
            alternate={index % 2 === 1}
            block={block}
            contactAnchor={block.id === contactBlockId}
            contactHref={contactHref}
            key={block.id}
          />
        ))}
    </div>
  );
}

function Block({
  block,
  alternate,
  contactAnchor,
  contactHref,
}: {
  block: StoredBlock;
  alternate: boolean;
  contactAnchor: boolean;
  contactHref?: string;
}) {
  const value = block.properties;
  switch (value.type) {
    case "hero":
      return (
        <section className="tenant-hero relative isolate min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-16 text-white @[40rem]:min-h-[calc(100svh-5rem)] @[40rem]:px-8 @[40rem]:py-24">
          {value.imageUrl ? (
            <Image
              alt={value.imageAlt || ""}
              className="-z-30 object-cover"
              fill
              priority
              sizes="100vw"
              src={value.imageUrl}
              unoptimized
            />
          ) : null}
          <div className="tenant-hero-overlay absolute inset-0 -z-20" />
          <div className="tenant-hero-glow absolute -top-36 -right-36 -z-10 h-[36rem] w-[36rem] rounded-full blur-3xl" />
          <div className="mx-auto flex min-h-[calc(100svh-12rem)] max-w-7xl flex-col justify-end pb-4 @[40rem]:min-h-[calc(100svh-17rem)] @[40rem]:justify-center @[40rem]:pb-5">
            <div className="max-w-4xl">
              {value.eyebrow ? (
                <p className="reveal-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black tracking-[0.2em] uppercase backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-[var(--tenant-primary)] shadow-[0_0_18px_var(--tenant-primary)]" />
                  {value.eyebrow}
                </p>
              ) : null}
              <h1 className="reveal-up animation-delay-1 mt-6 max-w-4xl text-[clamp(2.6rem,12vw,7.2rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance @[40rem]:mt-7 @[40rem]:leading-[0.92] @[40rem]:tracking-[-0.065em]">
                {value.heading}
              </h1>
              <p className="reveal-up animation-delay-2 mt-5 max-w-2xl text-base leading-7 text-white/78 @[40rem]:mt-7 @[40rem]:text-xl @[40rem]:leading-8">
                {value.text}
              </p>
              <div className="reveal-up animation-delay-3 mt-7 flex flex-wrap items-center gap-4 @[40rem]:mt-9">
                {value.actionLabel && value.actionHref ? (
                  <Link
                    className="surface-lift inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full px-6 font-black text-white shadow-2xl @[40rem]:min-h-14 @[40rem]:w-auto @[40rem]:px-7"
                    href={resolveActionHref(value.actionHref, contactHref)}
                    style={{ backgroundColor: "var(--tenant-primary)" }}
                  >
                    {value.actionLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
                <span className="text-sm font-bold text-white/60">
                  Persönlich · digital · transparent
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-8 bottom-8 hidden items-center gap-3 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-xs font-bold backdrop-blur-xl @[40rem]:flex">
            <span className="text-xl" aria-hidden="true">
              ↓
            </span>
            Mehr entdecken
          </div>
        </section>
      );
    case "text_image":
      return (
        <section
          className={`tenant-section px-4 py-16 @[40rem]:px-8 @[40rem]:py-24 ${alternate ? "bg-slate-50" : "bg-white"}`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 @[64rem]:grid-cols-2 @[64rem]:gap-20">
            <div
              className={
                value.imagePosition === "left" ? "@[64rem]:order-2" : ""
              }
            >
              <SectionIntro
                eyebrow="Unsere Fahrschule"
                heading={value.heading}
              />
              <div className="mt-7 space-y-4 text-base leading-8 text-slate-600 @[40rem]:text-lg">
                {value.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Persönlich betreut",
                  "Klare Abläufe",
                  "Digital unterstützt",
                ].map((label) => (
                  <span
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
                    key={label}
                  >
                    ✓ {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="tenant-media-frame relative min-h-80 overflow-hidden rounded-[var(--radius-card)] bg-slate-200 shadow-2xl @[40rem]:min-h-[28rem]">
              {value.imageUrl ? (
                <Image
                  alt={value.imageAlt}
                  className="object-cover transition duration-700 hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={value.imageUrl}
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.95),transparent_32%),linear-gradient(135deg,var(--tenant-primary),var(--tenant-accent))]" />
              )}
              <div className="tenant-rating-card absolute right-5 bottom-5 rounded-2xl bg-white/92 px-5 py-4 text-slate-950 shadow-xl backdrop-blur-xl">
                <p className="text-2xl font-black">4,9 / 5</p>
                <p className="text-xs font-bold text-slate-500">
                  fiktive Beispielbewertung
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    case "benefits":
      return (
        <section className="tenant-section bg-white px-4 py-16 @[40rem]:px-8 @[40rem]:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionIntro eyebrow="Deine Vorteile" heading={value.heading} />
            <div className="mt-12 grid gap-5 @[48rem]:grid-cols-3">
              {value.items.map((item, index) => (
                <article
                  className="tenant-feature-card surface-lift group rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-sm @[40rem]:p-9"
                  key={item.title}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-xl text-white">
                      {["↗", "✓", "⌁", "★"][index % 4]}
                    </span>
                    <span className="text-xs font-black tracking-[0.2em] text-slate-300">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 text-2xl font-black tracking-tight @[40rem]:mt-10">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case "cta":
      return (
        <section className="bg-white px-4 py-12 @[40rem]:px-8 @[40rem]:py-16">
          <div className="tenant-cta relative mx-auto max-w-7xl overflow-hidden rounded-[var(--radius-card)] px-7 py-14 text-white @[40rem]:px-14 @[40rem]:py-20">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="relative grid items-end gap-8 @[64rem]:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black tracking-[0.2em] text-white/55 uppercase">
                  Bereit für den nächsten Schritt?
                </p>
                <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-balance @[40rem]:text-6xl @[40rem]:tracking-[-0.045em]">
                  {value.heading}
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  {value.text}
                </p>
              </div>
              <Link
                className="surface-lift inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-7 text-center font-black text-slate-950 @[40rem]:w-auto"
                href={resolveActionHref(value.actionHref, contactHref)}
              >
                {value.actionLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="tenant-section bg-white px-4 py-16 @[40rem]:px-8 @[40rem]:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 @[64rem]:grid-cols-[.7fr_1.3fr]">
            <SectionIntro eyebrow="Gut zu wissen" heading={value.heading} />
            <div className="space-y-3">
              {value.items.map((item, index) => (
                <details
                  className="group rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
                  key={item.question}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-xl px-5 py-5 font-black">
                    <span>
                      <span className="mr-3 text-slate-300">0{index + 1}</span>
                      {item.question}
                    </span>
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-6 leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    case "contact_teaser":
      return (
        <section
          className="tenant-contact scroll-mt-24 px-4 py-16 text-white @[40rem]:px-8 @[40rem]:py-24"
          id={contactAnchor ? "kontakt" : undefined}
        >
          <div className="mx-auto grid max-w-7xl items-end gap-10 @[64rem]:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-white/45 uppercase">
                Wir sind für dich da
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-balance @[40rem]:text-6xl @[40rem]:tracking-[-0.045em]">
                {value.heading}
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-white/65">
                {value.text}
              </p>
            </div>
            <div className="grid gap-3 text-sm font-black">
              {value.phone ? (
                <a
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 break-all backdrop-blur hover:bg-white/15 @[40rem]:w-auto @[40rem]:rounded-full @[40rem]:px-6"
                  href={`tel:${value.phone}`}
                >
                  ↗ {value.phone}
                </a>
              ) : null}
              {value.email ? (
                <a
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 break-all backdrop-blur hover:bg-white/15 @[40rem]:w-auto @[40rem]:rounded-full @[40rem]:px-6"
                  href={`mailto:${value.email}`}
                >
                  ↗ {value.email}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      );
    case "license_classes":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Ausbildung"
          heading={value.heading}
        >
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="tenant-content-card surface-lift relative overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white p-7 shadow-sm"
                key={item.id}
              >
                <span className="absolute top-5 right-5 text-6xl font-black text-slate-100">
                  {item.key}
                </span>
                <p className="tenant-card-eyebrow relative text-xs font-black tracking-[0.18em] text-[var(--tenant-primary)] uppercase">
                  Klasse {item.key}
                </p>
                <h3 className="relative mt-12 text-2xl font-black">
                  {item.title}
                </h3>
                <p className="relative mt-3 leading-7 text-slate-600">
                  {item.description}
                </p>
                {item.minimumAge ? (
                  <p className="relative mt-6 border-t border-slate-100 pt-4 text-sm font-bold">
                    Ab {item.minimumAge} Jahren
                  </p>
                ) : null}
              </article>
            ))}
        </ContentSection>
      );
    case "prices":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Transparent geplant"
          heading={value.heading}
        >
          {value.groups
            .filter((group) => group.active)
            .map((group) => (
              <article
                className="tenant-content-card rounded-[var(--radius-card)] border border-slate-200 bg-white p-7 shadow-sm"
                key={group.id}
              >
                <div className="flex flex-col items-start gap-3 @[40rem]:flex-row @[40rem]:items-center @[40rem]:justify-between @[40rem]:gap-4">
                  <h3 className="text-2xl font-black">{group.title}</h3>
                  <span className="tenant-chip rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Beispiel
                  </span>
                </div>
                <dl className="mt-7 divide-y divide-slate-100">
                  {group.items
                    .filter((item) => item.active)
                    .map((item) => (
                      <div
                        className="flex justify-between gap-5 py-4 text-sm"
                        key={item.id}
                      >
                        <dt className="text-slate-600">{item.label}</dt>
                        <dd className="text-right font-black">
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: item.currency,
                          }).format(Number(item.amount))}
                          {item.unit ? (
                            <span className="block text-[0.68rem] font-semibold text-slate-400">
                              je {item.unit}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    ))}
                </dl>
              </article>
            ))}
        </ContentSection>
      );
    case "courses":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Nächste Termine"
          heading={value.heading}
        >
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="tenant-content-card rounded-[var(--radius-card)] border border-slate-200 bg-white p-7 shadow-sm"
                key={item.id}
              >
                <p className="tenant-card-eyebrow text-xs font-black tracking-[0.18em] text-[var(--tenant-primary)] uppercase">
                  Kurs
                </p>
                <h3 className="mt-3 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {item.description}
                </p>
                <div className="mt-6 space-y-2">
                  {item.dates.map((date) => (
                    <time
                      className="tenant-chip block rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"
                      dateTime={date.startsAt}
                      key={date.id}
                    >
                      ◷{" "}
                      {new Intl.DateTimeFormat("de-DE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: date.timezone,
                      }).format(new Date(date.startsAt))}
                    </time>
                  ))}
                </div>
              </article>
            ))}
        </ContentSection>
      );
    case "team":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Menschen mit Geduld"
          heading={value.heading}
        >
          {value.items
            .filter((item) => item.active)
            .map((item, index) => (
              <article
                className="tenant-content-card overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-sm"
                key={item.id}
              >
                <div className="tenant-team-portrait relative grid aspect-[4/3] place-items-center overflow-hidden text-7xl font-black text-white/90">
                  {item.imageUrl ? (
                    <Image
                      alt={item.imageAlt || `Teamfoto ${item.name}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      height={600}
                      src={item.imageUrl}
                      unoptimized
                      width={800}
                    />
                  ) : (
                    <span>
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                  )}
                  <span className="absolute right-8 bottom-6 text-sm opacity-60">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-7">
                  <p className="tenant-card-eyebrow text-xs font-black tracking-[0.16em] text-[var(--tenant-primary)] uppercase">
                    {item.role}
                  </p>
                  <h3 className="mt-2 text-2xl font-black">{item.name}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.bio}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.qualifications.map((qualification) => (
                      <span
                        className="tenant-chip rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                        key={qualification}
                      >
                        {qualification}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
        </ContentSection>
      );
    case "fleet":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Modern unterwegs"
          heading={value.heading}
        >
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="tenant-content-card group overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-sm"
                key={item.id}
              >
                {item.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      alt={item.imageAlt || item.name}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      src={item.imageUrl}
                      unoptimized
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
                  </div>
                ) : null}
                <div className="p-7">
                  <div className="flex items-center justify-between gap-3">
                    <p className="tenant-card-eyebrow text-xs font-black tracking-[0.16em] text-[var(--tenant-primary)] uppercase">
                      {item.category}
                    </p>
                    <span className="tenant-chip rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {item.transmission === "automatic"
                        ? "Automatik"
                        : "Schaltung"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black">{item.name}</h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
        </ContentSection>
      );
    case "locations": {
      const activeLocations = value.items.filter((item) => item.active);
      return (
        <ContentSection
          alternate={alternate}
          eyebrow="Vor Ort für dich"
          heading={value.heading}
        >
          {activeLocations.length ? (
            <div className="relative col-span-full min-h-72 overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-slate-900 shadow-xl">
              <div className="absolute inset-0 [background-image:linear-gradient(35deg,transparent_47%,rgba(255,255,255,.16)_48%,transparent_50%),linear-gradient(145deg,transparent_47%,rgba(255,255,255,.12)_48%,transparent_50%)] [background-size:95px_95px] opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,var(--tenant-primary),transparent_24%),radial-gradient(circle_at_78%_70%,var(--tenant-primary),transparent_20%)] opacity-35" />
              <div className="relative flex min-h-72 flex-col justify-between p-6 text-white @[40rem]:p-8">
                <div>
                  <p className="text-xs font-black tracking-[.18em] text-white/55 uppercase">
                    Standortübersicht
                  </p>
                  <p className="mt-2 max-w-lg text-xl font-black">
                    {activeLocations.length === 1
                      ? "Hier findest du uns"
                      : `${activeLocations.length} Standorte auf einen Blick`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {activeLocations.map((item, index) => {
                    const address = `${item.street}, ${item.postalCode} ${item.city}`;
                    return (
                      <a
                        className="group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur hover:bg-white/20 @[40rem]:w-auto"
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`}
                        key={item.id}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className="grid size-9 place-items-center rounded-full bg-[var(--tenant-primary)] font-black text-white shadow-lg">
                          {index + 1}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-sm">
                            {item.name}
                          </strong>
                          <span className="block text-xs leading-5 text-white/60">
                            In OpenStreetMap öffnen ↗
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          {activeLocations.map((item, index) => (
            <article
              className="tenant-content-card rounded-[var(--radius-card)] border border-slate-200 bg-white p-7 shadow-sm"
              itemScope
              itemType="https://schema.org/DrivingSchool"
              key={item.id}
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-xl text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="mt-6 text-2xl font-black" itemProp="name">
                {item.name}
              </h3>
              <address
                className="mt-3 leading-7 text-slate-600 not-italic"
                itemProp="address"
              >
                {item.street}
                <br />
                {item.postalCode} {item.city}
              </address>
              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
                {item.openingHours.map((hours) => (
                  <li
                    className="flex justify-between gap-4"
                    key={hours.weekday}
                  >
                    <span className="font-bold">{weekdays[hours.weekday]}</span>
                    <span className="text-slate-500">
                      {hours.closed
                        ? "geschlossen"
                        : `${hours.opensAt}–${hours.closesAt}`}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </ContentSection>
      );
    }
    case "testimonials":
      return (
        <ContentSection
          alternate={alternate}
          eyebrow={
            value.items.some((item) =>
              item.sourceLabel?.toLocaleLowerCase("de-DE").includes("fiktiv"),
            )
              ? "Fiktive Beispielstimmen"
              : "Bewertungen"
          }
          heading={value.heading}
        >
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <figure
                className="tenant-content-card rounded-[var(--radius-card)] border border-slate-200 bg-white p-7 shadow-sm"
                key={item.id}
              >
                <div
                  className="testimonial-rating text-lg tracking-[0.18em] text-[var(--tenant-primary)]"
                  aria-label={`${item.rating ?? 5} von 5 Sternen`}
                >
                  {"★★★★★".slice(0, item.rating ?? 5)}
                </div>
                <blockquote className="mt-6 text-xl leading-8 font-bold">
                  „{item.quote}“
                </blockquote>
                <figcaption className="mt-7 border-t border-slate-100 pt-5 text-sm">
                  <span className="font-black">{item.displayName}</span>
                  {item.sourceLabel ? (
                    <span className="testimonial-source block text-slate-400">
                      {item.sourceLabel}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
        </ContentSection>
      );
  }
}

function resolveActionHref(href: string | undefined, contactHref?: string) {
  return href === "/kontakt" && contactHref ? contactHref : (href ?? "/");
}

function SectionIntro({
  eyebrow,
  heading,
}: {
  eyebrow: string;
  heading: string;
}) {
  return (
    <div>
      <p className="tenant-section-eyebrow text-xs font-black tracking-[0.2em] text-[var(--tenant-primary)] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-4xl text-3xl leading-[1.05] font-black tracking-[-0.04em] text-balance @[40rem]:text-6xl @[40rem]:leading-[1.02] @[40rem]:tracking-[-0.045em]">
        {heading}
      </h2>
    </div>
  );
}

function ContentSection({
  alternate,
  eyebrow,
  heading,
  children,
}: {
  alternate: boolean;
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`tenant-section px-4 py-16 @[40rem]:px-8 @[40rem]:py-24 ${alternate ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow={eyebrow} heading={heading} />
        <div className="mt-12 grid gap-5 @[48rem]:grid-cols-2 @[64rem]:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
