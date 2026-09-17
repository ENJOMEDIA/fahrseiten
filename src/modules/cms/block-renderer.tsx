import Link from "next/link";

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
        <section className="bg-slate-950 px-6 py-24 text-white">
          <div className="mx-auto max-w-6xl">
            {value.eyebrow ? (
              <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300 uppercase">
                {value.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {value.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {value.text}
            </p>
            {value.actionLabel && value.actionHref ? (
              <Link
                className="mt-8 inline-flex rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
                href={value.actionHref}
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
            className="min-h-64 rounded-[var(--radius-card)] bg-gradient-to-br from-cyan-100 to-slate-200"
            role="img"
            aria-label={value.imageAlt || "Dekorative Bildfläche"}
          />
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
                  className="rounded-[var(--radius-card)] border border-slate-200 p-6"
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
          <div className="mx-auto max-w-6xl rounded-[var(--radius-card)] bg-cyan-600 p-8 text-white sm:p-12">
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
  }
}
