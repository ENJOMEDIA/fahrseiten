"use client";

import type { BlockProperties } from "@/modules/cms/block-schema";

type Props = {
  properties: BlockProperties;
  onPatch: (patch: Partial<BlockProperties>) => void;
};

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 p-2";

export function BuilderBlockFields({ properties, onPatch }: Props) {
  if (properties.type === "hero")
    return (
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Kleine Zeile über der Überschrift
          <input
            className={inputClass}
            value={properties.eyebrow ?? ""}
            onChange={(event) => onPatch({ eyebrow: event.target.value })}
          />
        </label>
        <label className="text-sm">
          Text auf der Schaltfläche
          <input
            className={inputClass}
            value={properties.actionLabel ?? ""}
            onChange={(event) => onPatch({ actionLabel: event.target.value })}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Ziel der Schaltfläche
          <input
            className={inputClass}
            placeholder="Zum Beispiel /kontakt"
            value={properties.actionHref ?? ""}
            onChange={(event) => onPatch({ actionHref: event.target.value })}
          />
        </label>
      </div>
    );

  if (properties.type === "text_image")
    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Textabsätze</p>
          <button
            className="rounded-lg border px-3 py-2 text-xs font-semibold"
            disabled={properties.paragraphs.length >= 8}
            onClick={() =>
              onPatch({
                paragraphs: [...properties.paragraphs, "Neuer Textabsatz"],
              })
            }
            type="button"
          >
            Absatz hinzufügen
          </button>
        </div>
        {properties.paragraphs.map((paragraph, index) => (
          <div className="flex items-start gap-2" key={index}>
            <textarea
              aria-label={`Textabsatz ${index + 1}`}
              className="min-h-20 flex-1 rounded-lg border border-slate-300 p-2 text-sm"
              value={paragraph}
              onChange={(event) =>
                onPatch({
                  paragraphs: properties.paragraphs.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                })
              }
            />
            <button
              aria-label={`Textabsatz ${index + 1} entfernen`}
              className="rounded-lg border border-red-200 px-3 py-2 text-red-700"
              disabled={properties.paragraphs.length === 1}
              onClick={() =>
                onPatch({
                  paragraphs: properties.paragraphs.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                })
              }
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        <label className="block text-sm">
          Bildposition
          <select
            className={inputClass}
            value={properties.imagePosition}
            onChange={(event) =>
              onPatch({ imagePosition: event.target.value as "left" | "right" })
            }
          >
            <option value="right">Bild rechts</option>
            <option value="left">Bild links</option>
          </select>
        </label>
      </div>
    );

  if (properties.type === "benefits")
    return (
      <RepeatingCards
        addLabel="Vorteil hinzufügen"
        disabled={properties.items.length >= 8}
        onAdd={() =>
          onPatch({
            items: [
              ...properties.items,
              {
                title: "Ein weiterer Vorteil",
                text: "Beschreibe kurz, was eure Fahrschule besonders macht.",
              },
            ],
          })
        }
      >
        {properties.items.map((item, index) => (
          <div className="rounded-xl border bg-slate-50 p-3" key={index}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Vorteil {index + 1}
              </p>
              <RemoveButton
                disabled={properties.items.length === 1}
                label={`Vorteil ${index + 1} entfernen`}
                onClick={() =>
                  onPatch({
                    items: properties.items.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
              />
            </div>
            <input
              aria-label={`Titel von Vorteil ${index + 1}`}
              className={inputClass}
              value={item.title}
              onChange={(event) =>
                onPatch({
                  items: properties.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, title: event.target.value }
                      : current,
                  ),
                })
              }
            />
            <textarea
              aria-label={`Text von Vorteil ${index + 1}`}
              className="mt-2 min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm"
              value={item.text}
              onChange={(event) =>
                onPatch({
                  items: properties.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, text: event.target.value }
                      : current,
                  ),
                })
              }
            />
          </div>
        ))}
      </RepeatingCards>
    );

  if (properties.type === "faq")
    return (
      <RepeatingCards
        addLabel="Frage hinzufügen"
        disabled={properties.items.length >= 30}
        onAdd={() =>
          onPatch({
            items: [
              ...properties.items,
              {
                question: "Neue häufige Frage",
                answer: "Trage hier eine hilfreiche Antwort ein.",
              },
            ],
          })
        }
      >
        {properties.items.map((item, index) => (
          <div className="rounded-xl border bg-slate-50 p-3" key={index}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Frage {index + 1}
              </p>
              <RemoveButton
                disabled={properties.items.length === 1}
                label={`Frage ${index + 1} entfernen`}
                onClick={() =>
                  onPatch({
                    items: properties.items.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
              />
            </div>
            <input
              aria-label={`Frage ${index + 1}`}
              className={inputClass}
              value={item.question}
              onChange={(event) =>
                onPatch({
                  items: properties.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, question: event.target.value }
                      : current,
                  ),
                })
              }
            />
            <textarea
              aria-label={`Antwort ${index + 1}`}
              className="mt-2 min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm"
              value={item.answer}
              onChange={(event) =>
                onPatch({
                  items: properties.items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, answer: event.target.value }
                      : current,
                  ),
                })
              }
            />
          </div>
        ))}
      </RepeatingCards>
    );

  if (properties.type === "cta")
    return (
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Text auf der Schaltfläche
          <input
            className={inputClass}
            value={properties.actionLabel}
            onChange={(event) => onPatch({ actionLabel: event.target.value })}
          />
        </label>
        <label className="text-sm">
          Ziel der Schaltfläche
          <input
            className={inputClass}
            placeholder="Zum Beispiel /kontakt"
            value={properties.actionHref}
            onChange={(event) => onPatch({ actionHref: event.target.value })}
          />
        </label>
      </div>
    );

  if (properties.type === "contact_teaser")
    return (
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Telefonnummer
          <input
            className={inputClass}
            value={properties.phone ?? ""}
            onChange={(event) => onPatch({ phone: event.target.value })}
          />
        </label>
        <label className="text-sm">
          E-Mail-Adresse
          <input
            className={inputClass}
            type="email"
            value={properties.email ?? ""}
            onChange={(event) => onPatch({ email: event.target.value })}
          />
        </label>
      </div>
    );

  return null;
}

function RepeatingCards({
  children,
  addLabel,
  disabled,
  onAdd,
}: {
  children: React.ReactNode;
  addLabel: string;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      {children}
      <button
        className="w-full rounded-xl border border-dashed border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900"
        disabled={disabled}
        onClick={onAdd}
        type="button"
      >
        ＋ {addLabel}
      </button>
    </div>
  );
}

function RemoveButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      Entfernen
    </button>
  );
}
