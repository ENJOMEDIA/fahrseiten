import Link from "next/link";
import Image from "next/image";

import type { StoredBlock } from "./block-schema";

export function BlockRenderer({ blocks }: { blocks: readonly StoredBlock[] }) {
  return (
    <>
      {blocks
        .filter((block) => block.visible)
        .map((block) => (
          <Block key={block.id} block={block} />
        ))}
    </>
  );
}

function Block({ block }: { block: StoredBlock }) {
  const value = block.properties;
  switch (value.type) {
    case "hero":
      return (
        <section
          className="relative isolate min-h-[38rem] overflow-hidden px-6 py-24 text-white"
          style={{ backgroundColor: "var(--tenant-accent, #0f172a)" }}
        >
          {value.imageUrl ? (
            <Image
              alt={value.imageAlt || ""}
              className="-z-20 object-cover"
              fill
              priority
              sizes="100vw"
              src={value.imageUrl}
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/10" />
          <div className="mx-auto flex min-h-[26rem] max-w-6xl flex-col justify-center">
            {value.eyebrow ? (
              <p
                className="text-sm font-semibold tracking-[0.18em] uppercase"
                style={{ color: "var(--tenant-primary, #22d3ee)" }}
              >
                {value.eyebrow}
              </p>
            ) : null}
            <h1 className="reveal-up mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
              {value.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {value.text}
            </p>
            {value.actionLabel && value.actionHref ? (
              <Link
                className="surface-lift mt-8 inline-flex w-fit rounded-full px-6 py-3 font-semibold text-white shadow-xl"
                href={value.actionHref}
                style={{ backgroundColor: "var(--tenant-primary, #0891b2)" }}
              >
                {value.actionLabel}
              </Link>
            ) : null}
          </div>
        </section>
      );
    case "text_image":
      return (
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <div className={value.imagePosition === "left" ? "md:order-2" : ""}>
            <h2 className="text-3xl font-semibold">{value.heading}</h2>
            {value.paragraphs.map((paragraph, index) => (
              <p className="mt-4 leading-7 text-slate-600" key={index}>
                {paragraph}
              </p>
            ))}
          </div>
          <div
            className="relative min-h-80 overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-cyan-100 to-slate-200 shadow-2xl"
            role="img"
            aria-label={value.imageAlt || "Dekorative Bildfläche"}
          >
            {value.imageUrl ? (
              <Image
                alt={value.imageAlt}
                className="object-cover transition duration-700 hover:scale-105"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                src={value.imageUrl}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.9),transparent_45%)]" />
            )}
          </div>
        </section>
      );
    case "benefits":
      return (
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold">{value.heading}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {value.items.map((item) => (
                <article
                  className="surface-lift rounded-[var(--radius-card)] border border-slate-200 p-7 shadow-sm"
                  key={item.title}
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case "cta":
      return (
        <section className="px-6 py-16">
          <div
            className="mx-auto max-w-6xl rounded-[var(--radius-card)] p-8 text-white sm:p-12"
            style={{ backgroundColor: "var(--tenant-primary, #0891b2)" }}
          >
            <h2 className="text-3xl font-semibold">{value.heading}</h2>
            <p className="mt-3 max-w-2xl text-cyan-50">{value.text}</p>
            <Link
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-cyan-900"
              href={value.actionHref}
            >
              {value.actionLabel}
            </Link>
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-semibold">{value.heading}</h2>
          <div className="mt-8 divide-y divide-slate-200">
            {value.items.map((item) => (
              <details className="py-5" key={item.question}>
                <summary className="cursor-pointer font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case "contact_teaser":
      return (
        <section className="bg-slate-100 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold">{value.heading}</h2>
            <p className="mt-4 text-slate-600">{value.text}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {value.phone ? (
                <a
                  className="font-semibold text-cyan-800"
                  href={`tel:${value.phone}`}
                >
                  {value.phone}
                </a>
              ) : null}
              {value.email ? (
                <a
                  className="font-semibold text-cyan-800"
                  href={`mailto:${value.email}`}
                >
                  {value.email}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      );
    case "license_classes":
      return (
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-6"
                key={item.id}
              >
                <p className="text-sm font-bold text-cyan-700">
                  Klasse {item.key}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-slate-600">{item.description}</p>
                {item.minimumAge ? (
                  <p className="mt-3 text-sm">
                    Mindestalter: {item.minimumAge}
                  </p>
                ) : null}
              </article>
            ))}
        </ContentSection>
      );
    case "prices":
      return (
        <ContentSection heading={value.heading}>
          {value.groups
            .filter((group) => group.active)
            .map((group) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-6"
                key={group.id}
              >
                <h3 className="text-xl font-semibold">{group.title}</h3>
                <dl className="mt-4 space-y-3">
                  {group.items
                    .filter((item) => item.active)
                    .map((item) => (
                      <div className="flex justify-between gap-4" key={item.id}>
                        <dt>{item.label}</dt>
                        <dd className="font-semibold">
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: item.currency,
                          }).format(Number(item.amount))}
                          {item.unit ? ` / ${item.unit}` : ""}
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
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-6"
                key={item.id}
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-slate-600">{item.description}</p>
                {item.dates.map((date) => (
                  <time
                    className="mt-3 block text-sm font-medium"
                    dateTime={date.startsAt}
                    key={date.id}
                  >
                    {new Intl.DateTimeFormat("de-DE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: date.timezone,
                    }).format(new Date(date.startsAt))}
                  </time>
                ))}
              </article>
            ))}
        </ContentSection>
      );
    case "team":
      return (
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article className="rounded-2xl bg-white p-6" key={item.id}>
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-cyan-700">{item.role}</p>
                <p className="mt-3 text-slate-600">{item.bio}</p>
              </article>
            ))}
        </ContentSection>
      );
    case "fleet":
      return (
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="group overflow-hidden rounded-3xl bg-white shadow-sm"
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
                  </div>
                ) : null}
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="mt-1 text-sm text-cyan-700">
                    {item.category} ·{" "}
                    {item.transmission === "automatic"
                      ? "Automatik"
                      : "Schaltung"}
                  </p>
                  <p className="mt-3 text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
        </ContentSection>
      );
    case "locations":
      return (
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <article
                className="rounded-2xl bg-white p-6"
                itemScope
                itemType="https://schema.org/DrivingSchool"
                key={item.id}
              >
                <h3 className="text-xl font-semibold" itemProp="name">
                  {item.name}
                </h3>
                <address
                  className="mt-3 text-slate-600 not-italic"
                  itemProp="address"
                >
                  {item.street}
                  <br />
                  {item.postalCode} {item.city}
                </address>
                <ul className="mt-4 text-sm">
                  {item.openingHours.map((hours) => (
                    <li key={hours.weekday}>
                      Tag {hours.weekday}:{" "}
                      {hours.closed
                        ? "geschlossen"
                        : `${hours.opensAt}–${hours.closesAt}`}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </ContentSection>
      );
    case "testimonials":
      return (
        <ContentSection heading={value.heading}>
          {value.items
            .filter((item) => item.active)
            .map((item) => (
              <figure className="rounded-2xl bg-white p-6" key={item.id}>
                <blockquote className="text-lg">„{item.quote}“</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {item.displayName}
                  {item.sourceLabel ? ` · ${item.sourceLabel}` : ""}
                </figcaption>
              </figure>
            ))}
        </ContentSection>
      );
  }
}

function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
          Entdecken
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">
          {heading}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
