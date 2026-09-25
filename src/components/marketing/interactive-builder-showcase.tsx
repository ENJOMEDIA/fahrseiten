"use client";

import { useState } from "react";

type ShowcaseBlock = {
  id: string;
  title: string;
  text: string;
  visible: boolean;
};

const initialBlocks: ShowcaseBlock[] = [
  {
    id: "hero",
    title: "Einstieg",
    text: "Willkommen bei deiner Fahrschule",
    visible: true,
  },
  {
    id: "classes",
    title: "Führerscheinklassen",
    text: "Dein Weg zum Führerschein",
    visible: true,
  },
  {
    id: "benefits",
    title: "Vorteile",
    text: "Darum lernen Fahrschüler bei uns",
    visible: true,
  },
  {
    id: "contact",
    title: "Kontakt",
    text: "Jetzt unverbindlich anfragen",
    visible: true,
  },
];

const deviceWidths = {
  desktop: "w-full",
  tablet: "w-[78%]",
  mobile: "w-[48%] min-w-40",
} as const;

export function InteractiveBuilderShowcase() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[0].id);
  const [device, setDevice] = useState<keyof typeof deviceWidths>("desktop");
  const selectedIndex = blocks.findIndex((block) => block.id === selectedId);

  function moveSelected(direction: -1 | 1) {
    if (selectedIndex < 0) return;
    const target = selectedIndex + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const next = [...current];
      [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
      return next;
    });
  }

  function toggleSelected() {
    setBlocks((current) =>
      current.map((block) =>
        block.id === selectedId ? { ...block, visible: !block.visible } : block,
      ),
    );
  }

  return (
    <div className="builder-visual rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl shadow-slate-900/20 sm:p-5">
      <div className="overflow-hidden rounded-[1.75rem] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold text-cyan-700">SEITENINHALT</p>
            <p className="mt-1 font-semibold">Startseite</p>
          </div>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            Interaktiv ausprobieren
          </span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_.9fr]">
          <div className="border-b border-slate-100 p-4 sm:p-6 lg:border-r lg:border-b-0">
            <p className="mb-3 text-xs leading-5 text-slate-500">
              Block auswählen, verschieben oder ausblenden. Die Vorschau rechts
              reagiert direkt.
            </p>
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <button
                  aria-pressed={selectedId === block.id}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-cyan-300 aria-pressed:border-cyan-400 aria-pressed:bg-cyan-50"
                  key={block.id}
                  onClick={() => setSelectedId(block.id)}
                  type="button"
                >
                  <span aria-hidden="true" className="text-slate-300">
                    ⠿
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {block.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {block.text}
                    </span>
                  </span>
                  {!block.visible ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Aus
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                aria-label="Ausgewählten Block nach oben verschieben"
                className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold disabled:opacity-35"
                disabled={selectedIndex <= 0}
                onClick={() => moveSelected(-1)}
                type="button"
              >
                ↑ Hoch
              </button>
              <button
                aria-label="Ausgewählten Block nach unten verschieben"
                className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold disabled:opacity-35"
                disabled={selectedIndex === blocks.length - 1}
                onClick={() => moveSelected(1)}
                type="button"
              >
                ↓ Runter
              </button>
              <button
                className="min-h-11 rounded-xl bg-slate-950 px-2 text-xs font-semibold text-white"
                onClick={toggleSelected}
                type="button"
              >
                {blocks[selectedIndex]?.visible ? "Ausblenden" : "Einblenden"}
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-4 sm:p-6">
            <div className="mb-4 flex justify-center gap-1 rounded-xl bg-white p-1 shadow-sm">
              {(["desktop", "tablet", "mobile"] as const).map((item) => (
                <button
                  aria-pressed={device === item}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 capitalize aria-pressed:bg-slate-950 aria-pressed:text-white"
                  key={item}
                  onClick={() => setDevice(item)}
                  type="button"
                >
                  {item === "desktop"
                    ? "Desktop"
                    : item === "tablet"
                      ? "Tablet"
                      : "Mobil"}
                </button>
              ))}
            </div>
            <div
              aria-label="Live-Vorschau der sichtbaren Blöcke"
              className={`mx-auto min-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-[width] ${deviceWidths[device]}`}
            >
              <div className="h-5 bg-slate-950" />
              <div className="space-y-2 p-3">
                {blocks
                  .filter((block) => block.visible)
                  .map((block, index) => (
                    <div
                      className={
                        index === 0
                          ? "rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-4 text-white"
                          : "rounded-xl border border-slate-100 bg-slate-50 p-3"
                      }
                      key={block.id}
                    >
                      <p className="text-[10px] font-bold uppercase opacity-60">
                        {block.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold">{block.text}</p>
                    </div>
                  ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-500">
              Produktvorschau · Änderungen werden hier nicht gespeichert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
