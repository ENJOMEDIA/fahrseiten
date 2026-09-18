"use client";

import { useEffect, useMemo, useState } from "react";
import { BlockRenderer } from "@/modules/cms/block-renderer";
import type { BlockProperties, StoredBlock } from "@/modules/cms/block-schema";
import { uploadTenantMedia } from "@/app/kunde/medien/actions";
import { saveTenantBuilderTheme } from "@/app/kunde/website/builder/actions";
import {
  builderThemes,
  builderThemeValues,
  type BuilderThemeKey,
} from "./themes";
import {
  builderBlockCatalog,
  createBuilderBlockProperties,
  type BuilderBlockType,
} from "./block-catalog";
import type { TenantBuilderPage } from "./tenant-pages";
import {
  mediaCategoryLabels,
  tenantMediaCategoryValues,
  type MediaCategory,
} from "@/modules/media/service";
import {
  duplicateBlock,
  moveBlock,
  normalizePositions,
  validateDraft,
} from "./state";

type SaveState = "saved" | "saving" | "error";
const initialBlocks: StoredBlock[] = [
  {
    id: "demo-hero",
    schemaVersion: 1,
    position: 0,
    visible: true,
    properties: {
      type: "hero",
      eyebrow: "Deine Fahrschule",
      heading: "Sicher ans Ziel",
      text: "Bearbeite diesen Text und prüfe die direkte Vorschau.",
      actionLabel: "Kontakt",
      actionHref: "/kontakt",
    },
  },
  {
    id: "demo-cta",
    schemaVersion: 1,
    position: 1,
    visible: true,
    properties: {
      type: "cta",
      heading: "Bereit für den nächsten Schritt?",
      text: "Diese Seite ist ein lokaler Builder-Test.",
      actionLabel: "Mehr erfahren",
      actionHref: "/",
    },
  },
];

type BuilderMedia = {
  id: string;
  url: string;
  label: string;
  category: MediaCategory;
};

export function BuilderDemo({
  media = [],
  tenantMode = false,
  canUseThemes = false,
  initialTheme,
  initialPages,
}: {
  media?: BuilderMedia[];
  tenantMode?: boolean;
  canUseThemes?: boolean;
  initialTheme?: string;
  initialPages?: TenantBuilderPage[];
}) {
  const [pages, setPages] = useState<TenantBuilderPage[]>(
    initialPages?.length
      ? initialPages
      : [
          {
            id: "local-start",
            title: "Startseite",
            slug: "",
            blocks: initialBlocks,
          },
        ],
  );
  const [selectedPageId, setSelectedPageId] = useState(
    initialPages?.[0]?.id ?? "local-start",
  );
  const selectedPage =
    pages.find((page) => page.id === selectedPageId) ?? pages[0];
  const blocks = useMemo(() => selectedPage?.blocks ?? [], [selectedPage]);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<
    { label: string; blocks: StoredBlock[] }[]
  >([]);
  const [navigation, setNavigation] = useState("Start, Über uns, Kontakt");
  const [theme, setTheme] = useState<BuilderThemeKey>(
    builderThemeValues.includes(initialTheme as BuilderThemeKey)
      ? (initialTheme as BuilderThemeKey)
      : "calm_cyan",
  );
  const [font, setFont] = useState("system");
  const [logo, setLogo] = useState("none");
  const [newBlockType, setNewBlockType] = useState<BuilderBlockType>("hero");
  const serialized = useMemo(
    () => JSON.stringify({ pageId: selectedPageId, blocks }),
    [blocks, selectedPageId],
  );

  function setBlocks(
    update: StoredBlock[] | ((current: StoredBlock[]) => StoredBlock[]),
  ) {
    setPages((current) =>
      current.map((page) => {
        if (page.id !== selectedPageId) return page;
        const nextBlocks =
          typeof update === "function" ? update(page.blocks) : update;
        return { ...page, blocks: nextBlocks };
      }),
    );
  }

  useEffect(() => {
    const savingTimer = window.setTimeout(() => setSaveState("saving"), 0);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          tenantMode ? "/api/tenant/builder-draft" : "/api/demo/builder-draft",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: tenantMode
              ? serialized
              : JSON.stringify(JSON.parse(serialized).blocks),
          },
        );
        if (!response.ok) throw new Error();
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 350);
    return () => {
      window.clearTimeout(savingTimer);
      window.clearTimeout(timer);
    };
  }, [serialized, tenantMode]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState !== "saved") event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  function patchProperties(id: string, patch: Partial<BlockProperties>) {
    setMessage("");
    setBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? {
              ...block,
              properties: { ...block.properties, ...patch } as BlockProperties,
            }
          : block,
      ),
    );
  }
  function addBlock(type: BuilderBlockType) {
    const properties = createBuilderBlockProperties(type);
    setBlocks((current) =>
      normalizePositions([
        ...current,
        {
          id: crypto.randomUUID(),
          schemaVersion: 1,
          position: current.length,
          visible: true,
          properties,
        },
      ]),
    );
  }
  async function publish() {
    try {
      const valid = validateDraft(blocks);
      if (tenantMode) {
        setSaveState("saving");
        const response = await fetch("/api/tenant/builder-draft", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            pageId: selectedPageId,
            blocks: valid,
            publish: true,
          }),
        });
        if (!response.ok) throw new Error();
        setSaveState("saved");
      } else
        setHistory((current) => [
          ...current,
          {
            label: `Version ${current.length + 1}`,
            blocks: structuredClone(valid),
          },
        ]);
      setMessage("Seite erfolgreich veröffentlicht.");
    } catch {
      setMessage(
        "Veröffentlichung blockiert: Bitte markierte Felder korrigieren.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              Lokale Fixture-Umgebung
            </p>
            <h1 className="text-3xl font-semibold">Website-Builder</h1>
          </div>
          <div
            aria-live="polite"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold"
          >
            {saveState === "saving"
              ? "Wird gespeichert …"
              : saveState === "saved"
                ? "Entwurf gespeichert"
                : "Speichern fehlgeschlagen"}
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <section
            aria-label="Bearbeitung"
            className="space-y-4 rounded-3xl bg-white p-5 shadow-sm"
          >
            <label className="block text-sm font-semibold">
              Seite
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={selectedPageId}
                onChange={(event) => setSelectedPageId(event.target.value)}
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            </label>
            {!tenantMode ? (
              <button
                className="w-full rounded-xl border px-4 py-3 font-semibold"
                onClick={() => {
                  const id = crypto.randomUUID();
                  const name = `Neue Seite ${pages.length + 1}`;
                  setPages((current) => [
                    ...current,
                    {
                      id,
                      title: name,
                      slug: `seite-${pages.length + 1}`,
                      blocks: [],
                    },
                  ]);
                  setSelectedPageId(id);
                }}
              >
                Seite anlegen
              </button>
            ) : null}
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <label className="text-sm font-semibold">
                Blocktyp
                <select
                  className="mt-1 w-full rounded-xl border p-3"
                  value={newBlockType}
                  onChange={(event) =>
                    setNewBlockType(event.target.value as BuilderBlockType)
                  }
                >
                  <optgroup label="Freie Seitenbausteine">
                    {(
                      Object.entries(builderBlockCatalog) as [
                        BuilderBlockType,
                        (typeof builderBlockCatalog)[BuilderBlockType],
                      ][]
                    )
                      .filter(([, item]) => item.group === "layout")
                      .map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Automatische Inhaltsbereiche">
                    {(
                      Object.entries(builderBlockCatalog) as [
                        BuilderBlockType,
                        (typeof builderBlockCatalog)[BuilderBlockType],
                      ][]
                    )
                      .filter(([, item]) => item.group === "content")
                      .map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </label>
              <button
                className="self-end rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
                onClick={() => addBlock(newBlockType)}
              >
                Hinzufügen
              </button>
            </div>
            {blocks.map((block, index) => (
              <fieldset
                className="rounded-2xl border border-slate-200 p-4"
                key={block.id}
              >
                <legend className="px-2 font-semibold">
                  {builderBlockCatalog[block.properties.type].label}
                </legend>
                <label className="block text-sm">
                  Überschrift
                  <input
                    aria-invalid={!block.properties.heading}
                    className="mt-1 w-full rounded-lg border p-2"
                    value={block.properties.heading}
                    onChange={(event) =>
                      patchProperties(block.id, {
                        heading: event.target.value,
                      } as Partial<BlockProperties>)
                    }
                  />
                </label>
                {"text" in block.properties ? (
                  <label className="mt-3 block text-sm">
                    Text
                    <textarea
                      className="mt-1 min-h-20 w-full rounded-lg border p-2"
                      value={block.properties.text}
                      onChange={(event) =>
                        patchProperties(block.id, {
                          text: event.target.value,
                        } as Partial<BlockProperties>)
                      }
                    />
                  </label>
                ) : null}
                {block.properties.type === "hero" ||
                block.properties.type === "text_image" ? (
                  <label className="mt-3 block text-sm font-semibold">
                    Bild aus der Medienbibliothek
                    <select
                      className="mt-1 w-full rounded-lg border p-2 font-normal"
                      value={block.properties.imageUrl ?? ""}
                      onChange={(event) => {
                        const selected = media.find(
                          (asset) => asset.url === event.target.value,
                        );
                        patchProperties(block.id, {
                          imageUrl: selected?.url,
                          imageAlt: selected?.label ?? "",
                          ...(block.properties.type === "text_image"
                            ? { mediaId: selected?.id }
                            : {}),
                        } as Partial<BlockProperties>);
                      }}
                    >
                      <option value="">Kein Bild ausgewählt</option>
                      {tenantMediaCategoryValues.map((category) => {
                        const categoryMedia = media.filter(
                          (asset) => asset.category === category,
                        );
                        return categoryMedia.length ? (
                          <optgroup
                            key={category}
                            label={mediaCategoryLabels[category]}
                          >
                            {categoryMedia.map((asset) => (
                              <option key={asset.id} value={asset.url}>
                                {asset.label}
                              </option>
                            ))}
                          </optgroup>
                        ) : null;
                      })}
                    </select>
                  </label>
                ) : null}
                {builderBlockCatalog[block.properties.type].group ===
                "content" ? (
                  <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-xs leading-5 text-cyan-950">
                    Dieser Bereich übernimmt die freigegebenen Angaben aus
                    „Inhalte“. So werden Daten nur einmal gepflegt und auf der
                    Website automatisch aktuell gehalten.
                  </p>
                ) : null}
                {!block.properties.heading ? (
                  <p className="mt-2 text-sm text-red-700">
                    Eine Überschrift ist erforderlich.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    aria-label={`${block.properties.heading} nach oben`}
                    className="rounded-lg border px-3 py-2"
                    disabled={index === 0}
                    onClick={() =>
                      setBlocks((current) => moveBlock(current, block.id, -1))
                    }
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`${block.properties.heading} nach unten`}
                    className="rounded-lg border px-3 py-2"
                    disabled={index === blocks.length - 1}
                    onClick={() =>
                      setBlocks((current) => moveBlock(current, block.id, 1))
                    }
                  >
                    ↓
                  </button>
                  <button
                    className="rounded-lg border px-3 py-2"
                    onClick={() =>
                      setBlocks((current) =>
                        duplicateBlock(current, block.id, crypto.randomUUID()),
                      )
                    }
                  >
                    Duplizieren
                  </button>
                  <button
                    className="rounded-lg border px-3 py-2"
                    onClick={() =>
                      setBlocks((current) =>
                        current.map((item) =>
                          item.id === block.id
                            ? { ...item, visible: !item.visible }
                            : item,
                        ),
                      )
                    }
                  >
                    {block.visible ? "Ausblenden" : "Einblenden"}
                  </button>
                </div>
              </fieldset>
            ))}
            <label className="block text-sm font-semibold">
              Navigation
              <input
                className="mt-2 w-full rounded-xl border p-3"
                value={navigation}
                onChange={(event) => setNavigation(event.target.value)}
              />
            </label>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Designvorlage</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Drei kontrollierte Themes sorgen für ein stimmiges Layout
                    auf allen Geräten.
                  </p>
                </div>
                {!canUseThemes && tenantMode ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Ab Wachstum
                  </span>
                ) : null}
              </div>
              <form action={saveTenantBuilderTheme} className="mt-4">
                <div className="grid gap-2">
                  {builderThemeValues.map((key) => (
                    <label
                      className={`cursor-pointer rounded-xl border p-3 ${theme === key ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}
                      key={key}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          checked={theme === key}
                          disabled={tenantMode && !canUseThemes}
                          name="themeKey"
                          onChange={() => setTheme(key)}
                          type="radio"
                          value={key}
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">
                            {builderThemes[key].name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {builderThemes[key].description}
                          </span>
                        </span>
                        <span
                          className="size-7 rounded-full border-4 border-white shadow"
                          style={{
                            backgroundColor: builderThemes[key].primary,
                          }}
                        />
                      </span>
                    </label>
                  ))}
                </div>
                {tenantMode && canUseThemes ? (
                  <button
                    className="mt-3 w-full rounded-xl border px-4 py-2 text-sm font-semibold"
                    type="submit"
                  >
                    Design anwenden
                  </button>
                ) : null}
              </form>
            </div>
            <label className="block text-sm font-semibold">
              Schriftvariante
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={font}
                onChange={(event) => setFont(event.target.value)}
              >
                <option value="system">System Sans</option>
                <option value="serif-heading">Serif Überschriften</option>
              </select>
            </label>
            {tenantMode ? (
              <form
                action={uploadTenantMedia}
                className="rounded-2xl border border-dashed border-slate-300 p-4"
              >
                <h2 className="font-semibold">Neues Bild hochladen</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Das Bild wird optimiert und gleichzeitig im gewählten Bereich
                  deiner Medienbibliothek abgelegt.
                </p>
                <input name="usage" type="hidden" value="library" />
                <input
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="mt-3 block w-full text-sm"
                  name="file"
                  required
                  type="file"
                />
                <input
                  className="mt-3 w-full rounded-xl border p-2 text-sm"
                  name="altText"
                  placeholder="Kurze Bildbeschreibung"
                  required
                />
                <select
                  className="mt-3 w-full rounded-xl border p-2 text-sm"
                  defaultValue="content"
                  name="category"
                >
                  {tenantMediaCategoryValues.map((category) => (
                    <option key={category} value={category}>
                      {mediaCategoryLabels[category]}
                    </option>
                  ))}
                </select>
                <button
                  className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  type="submit"
                >
                  Hochladen & einsortieren
                </button>
              </form>
            ) : null}
            <label className="block text-sm font-semibold">
              Logo
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={logo}
                onChange={(event) => setLogo(event.target.value)}
              >
                <option value="none">Kein Logo</option>
                <option value="">Noch kein Medium ausgewählt</option>
              </select>
            </label>
            <button
              className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              onClick={publish}
            >
              Veröffentlichen
            </button>
            <p aria-live="polite" className="text-sm font-semibold">
              {message}
            </p>
            {history.length ? (
              <div>
                <h2 className="font-semibold">Versionshistorie</h2>
                {history.map((version) => (
                  <button
                    className="mt-2 mr-2 rounded-lg border px-3 py-2 text-sm"
                    key={version.label}
                    onClick={() => {
                      setBlocks(structuredClone(version.blocks));
                      setMessage(
                        `${version.label} als Entwurf wiederhergestellt.`,
                      );
                    }}
                  >
                    {version.label} wiederherstellen
                  </button>
                ))}
              </div>
            ) : null}
          </section>
          <section aria-label="Vorschau">
            <div
              className="mb-3 flex gap-2"
              role="group"
              aria-label="Vorschaugröße"
            >
              {(["desktop", "tablet", "mobile"] as const).map((value) => (
                <button
                  aria-pressed={device === value}
                  className="rounded-lg bg-white px-4 py-2 capitalize"
                  key={value}
                  onClick={() => setDevice(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <div
              className={`mx-auto overflow-hidden rounded-3xl bg-white shadow-lg transition-[max-width] ${device === "mobile" ? "max-w-[390px]" : device === "tablet" ? "max-w-[800px]" : "max-w-none"}`}
              data-theme={theme}
              style={
                {
                  "--tenant-primary": builderThemes[theme].primary,
                  "--tenant-accent": builderThemes[theme].accent,
                } as React.CSSProperties
              }
            >
              <BlockRenderer blocks={blocks} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
