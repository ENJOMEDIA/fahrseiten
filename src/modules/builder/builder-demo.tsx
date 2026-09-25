"use client";

import { useEffect, useMemo, useState } from "react";
import { BlockRenderer } from "@/modules/cms/block-renderer";
import type { BlockProperties, StoredBlock } from "@/modules/cms/block-schema";
import { uploadTenantMedia } from "@/app/kunde/medien/actions";
import { saveTenantBuilderTheme } from "@/app/kunde/website/builder/actions";
import {
  builderFonts,
  builderFontValues,
  builderThemes,
  builderThemeValues,
  type BuilderFontKey,
  type BuilderThemeKey,
} from "./themes";
import {
  builderBlockCatalog,
  createBuilderBlockProperties,
  type BuilderBlockType,
} from "./block-catalog";
import type { TenantBuilderPage } from "./tenant-pages";
import { BuilderBlockFields } from "./block-fields";
import {
  builderPageTemplateKeys,
  builderPageTemplates,
  createPageTemplateBlocks,
  normalizePageSlug,
  type BuilderPageTemplateKey,
} from "./page-templates";
import {
  mediaCategoryLabels,
  tenantMediaCategoryValues,
  type MediaCategory,
} from "@/modules/media/service";
import {
  duplicateBlock,
  moveBlock,
  moveBlockTo,
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

function ThemeMiniature({ theme }: { theme: BuilderThemeKey }) {
  const colors = builderThemes[theme];
  return (
    <span
      aria-hidden="true"
      className={`relative block h-14 w-20 shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm ${
        theme === "urban_night"
          ? "rounded-md bg-slate-950"
          : theme === "warm_motion"
            ? "rounded-2xl bg-orange-50"
            : "rounded-xl"
      }`}
    >
      <span
        className={`absolute inset-x-1.5 top-1.5 h-6 ${theme === "warm_motion" ? "rounded-xl" : "rounded-sm"}`}
        style={{
          background: `linear-gradient(125deg, ${colors.accent}, ${colors.primary})`,
        }}
      />
      <span
        className={`absolute bottom-1.5 left-1.5 h-4 bg-white/95 ${theme === "urban_night" ? "w-8 rounded-sm" : theme === "warm_motion" ? "w-11 -rotate-2 rounded-lg" : "w-11 rounded-md"}`}
      />
      <span
        className={`absolute right-1.5 bottom-1.5 h-4 ${theme === "urban_night" ? "w-6 translate-y-0.5 rounded-sm bg-blue-500" : theme === "warm_motion" ? "w-5 rotate-2 rounded-lg bg-orange-500" : "w-5 rounded-md bg-cyan-500"}`}
      />
    </span>
  );
}

function DesignSetup({
  theme,
  font,
  setTheme,
  setFont,
  tenantMode,
  canUseThemes,
}: {
  theme: BuilderThemeKey;
  font: BuilderFontKey;
  setTheme: (theme: BuilderThemeKey) => void;
  setFont: (font: BuilderFontKey) => void;
  tenantMode: boolean;
  canUseThemes: boolean;
}) {
  const locked = tenantMode && !canUseThemes;
  return (
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-cyan-800 uppercase">
            Schritt 1
          </p>
          <h2 className="mt-1 text-lg font-semibold">Design auswählen</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Wähle zuerst den Grundstil. Danach bearbeitest du Seiten und
            Inhalte.
          </p>
        </div>
        {locked ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Ab Wachstum
          </span>
        ) : null}
      </div>
      <form action={saveTenantBuilderTheme} className="mt-4 space-y-4">
        <div className="grid gap-2">
          {builderThemeValues.map((key) => (
            <label
              className={`cursor-pointer rounded-xl border bg-white p-3 ${theme === key ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"}`}
              key={key}
            >
              <span className="flex items-center gap-3">
                <input
                  checked={theme === key}
                  disabled={locked}
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
                <ThemeMiniature theme={key} />
              </span>
            </label>
          ))}
        </div>
        <label className="block text-sm font-semibold">
          Schriftstil
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal"
            disabled={locked}
            name="fontKey"
            value={font}
            onChange={(event) => setFont(event.target.value as BuilderFontKey)}
          >
            {builderFontValues.map((key) => (
              <option key={key} value={key}>
                {builderFonts[key].name} – {builderFonts[key].description}
              </option>
            ))}
          </select>
        </label>
        {tenantMode && canUseThemes ? (
          <button
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Design übernehmen
          </button>
        ) : null}
      </form>
    </div>
  );
}

export function BuilderDemo({
  media = [],
  tenantMode = false,
  canUseThemes = false,
  initialTheme,
  initialFont,
  initialPages,
  contentPresets = {},
}: {
  media?: BuilderMedia[];
  tenantMode?: boolean;
  canUseThemes?: boolean;
  initialTheme?: string;
  initialFont?: string;
  initialPages?: TenantBuilderPage[];
  contentPresets?: Partial<Record<BuilderBlockType, BlockProperties>>;
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
  const [workspaceView, setWorkspaceView] = useState<"edit" | "preview">(
    "edit",
  );
  const [message, setMessage] = useState("");
  const [showPageCreator, setShowPageCreator] = useState(false);
  const [pageTemplate, setPageTemplate] =
    useState<BuilderPageTemplateKey>("services");
  const [newPageTitle, setNewPageTitle] = useState(
    builderPageTemplates.services.suggestedTitle,
  );
  const [newPageSlug, setNewPageSlug] = useState(
    builderPageTemplates.services.suggestedSlug,
  );
  const [pageCreating, setPageCreating] = useState(false);
  const [pageCreateError, setPageCreateError] = useState("");
  const [history, setHistory] = useState<
    { label: string; blocks: StoredBlock[] }[]
  >([]);
  const [theme, setTheme] = useState<BuilderThemeKey>(
    builderThemeValues.includes(initialTheme as BuilderThemeKey)
      ? (initialTheme as BuilderThemeKey)
      : "calm_cyan",
  );
  const [font, setFont] = useState<BuilderFontKey>(
    builderFontValues.includes(initialFont as BuilderFontKey)
      ? (initialFont as BuilderFontKey)
      : "system_sans",
  );
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    initialPages?.[0]?.blocks[0]?.id ?? initialBlocks[0].id,
  );
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (window.innerWidth < 640) setDevice("mobile");
      else if (window.innerWidth < 1024) setDevice("tablet");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

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
    const properties = structuredClone(
      contentPresets[type] ?? createBuilderBlockProperties(type),
    );
    const id = crypto.randomUUID();
    setBlocks((current) =>
      normalizePositions([
        ...current,
        {
          id,
          schemaVersion: 1,
          position: current.length,
          visible: true,
          properties,
        },
      ]),
    );
    setExpandedBlockId(id);
  }
  function choosePageTemplate(template: BuilderPageTemplateKey) {
    const preset = builderPageTemplates[template];
    setPageTemplate(template);
    setNewPageTitle(preset.suggestedTitle);
    setNewPageSlug(preset.suggestedSlug);
    setPageCreateError("");
  }
  async function createPage() {
    const title = newPageTitle.trim();
    const slug = normalizePageSlug(newPageSlug || title);
    if (title.length < 2 || !slug) {
      setPageCreateError(
        "Bitte gib einen Seitennamen und eine gültige URL ein.",
      );
      return;
    }
    if (pages.some((page) => page.slug === slug)) {
      setPageCreateError("Diese Seiten-URL ist bereits vergeben.");
      return;
    }
    setPageCreating(true);
    setPageCreateError("");
    const templateBlocks = createPageTemplateBlocks(
      pageTemplate,
      contentPresets,
    );
    try {
      let page: TenantBuilderPage;
      if (tenantMode) {
        const response = await fetch("/api/tenant/builder-pages", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, slug, blocks: templateBlocks }),
        });
        const result = (await response.json()) as {
          page?: TenantBuilderPage;
          error?: string;
          message?: string;
        };
        if (!response.ok || !result.page)
          throw new Error(
            result.message ||
              result.error ||
              "Die Seite konnte nicht angelegt werden.",
          );
        page = result.page;
      } else {
        page = {
          id: crypto.randomUUID(),
          title,
          slug,
          blocks: templateBlocks,
        };
      }
      setPages((current) => [...current, page]);
      setSelectedPageId(page.id);
      setExpandedBlockId(page.blocks[0]?.id ?? null);
      setShowPageCreator(false);
      setMessage(
        `„${page.title}“ wurde als Entwurf angelegt. Sie erscheint nach der Veröffentlichung in der Navigation.`,
      );
    } catch (error) {
      setPageCreateError(
        error instanceof Error
          ? error.message
          : "Die Seite konnte nicht angelegt werden.",
      );
    } finally {
      setPageCreating(false);
    }
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
    <div className="min-h-screen min-w-0 overflow-x-clip bg-slate-100 p-2 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-[1500px] min-w-0">
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cyan-700">
              {tenantMode ? "Website gestalten" : "Builder ausprobieren"}
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Website-Builder
            </h1>
          </div>
          <div
            aria-live="polite"
            className="self-start rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap sm:self-auto"
          >
            {saveState === "saving"
              ? "Wird gespeichert …"
              : saveState === "saved"
                ? "Entwurf gespeichert"
                : "Speichern fehlgeschlagen"}
          </div>
        </div>
        <div
          aria-label="Builder-Ansicht"
          className="sticky top-[4.5rem] z-30 mb-4 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl 2xl:hidden"
          role="group"
        >
          <button
            aria-pressed={workspaceView === "edit"}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              workspaceView === "edit"
                ? "bg-slate-950 text-white"
                : "text-slate-600"
            }`}
            onClick={() => setWorkspaceView("edit")}
            type="button"
          >
            Bearbeiten
          </button>
          <button
            aria-pressed={workspaceView === "preview"}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              workspaceView === "preview"
                ? "bg-cyan-600 text-white"
                : "text-slate-600"
            }`}
            onClick={() => setWorkspaceView("preview")}
            type="button"
          >
            Vorschau
          </button>
        </div>
        <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
          <section
            aria-label="Bearbeitung"
            className={`${workspaceView === "edit" ? "block" : "hidden"} min-w-0 space-y-4 rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5 2xl:block`}
          >
            <DesignSetup
              canUseThemes={canUseThemes}
              font={font}
              setFont={setFont}
              setTheme={setTheme}
              tenantMode={tenantMode}
              theme={theme}
            />
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-bold tracking-[.16em] text-cyan-800 uppercase">
                Schritt 2
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Seite und Bereiche bearbeiten
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Öffne nur den Bereich, den du gerade ändern möchtest. Alles wird
                automatisch als Entwurf gespeichert.
              </p>
            </div>
            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Deine Seiten</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Wähle eine Seite aus oder lege eine neue mit Vorlage an.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  {pages.length} {pages.length === 1 ? "Seite" : "Seiten"}
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {pages.map((page) => (
                  <button
                    aria-pressed={page.id === selectedPageId}
                    className={`rounded-xl border p-3 text-left transition ${
                      page.id === selectedPageId
                        ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100"
                        : "border-slate-200 bg-white hover:border-cyan-300"
                    }`}
                    key={page.id}
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setExpandedBlockId(page.blocks[0]?.id ?? null);
                    }}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{page.title}</span>
                      <span className="text-xs text-slate-500">
                        {page.blocks.length} Bereiche
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      /{page.slug}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="mt-3 w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
                onClick={() => setShowPageCreator((current) => !current)}
                type="button"
              >
                {showPageCreator ? "Abbrechen" : "＋ Neue Seite anlegen"}
              </button>
              {showPageCreator ? (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold">
                    1. Passende Vorlage wählen
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {builderPageTemplateKeys.map((key) => {
                      const preset = builderPageTemplates[key];
                      return (
                        <button
                          aria-pressed={pageTemplate === key}
                          className={`rounded-xl border p-3 text-left ${
                            pageTemplate === key
                              ? "border-cyan-500 bg-cyan-50"
                              : "border-slate-200 bg-white"
                          }`}
                          key={key}
                          onClick={() => choosePageTemplate(key)}
                          type="button"
                        >
                          <span className="block text-sm font-semibold">
                            {preset.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {preset.description}
                          </span>
                          <span className="mt-2 block text-xs font-semibold text-cyan-800">
                            {preset.blocks.length
                              ? `${preset.blocks.length} fertige Bereiche`
                              : "Ohne Bereiche"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm font-semibold">
                    2. Name und Adresse festlegen
                  </p>
                  <label className="mt-2 block text-sm">
                    Seitenname
                    <input
                      className="mt-1 w-full rounded-xl border p-3"
                      value={newPageTitle}
                      onChange={(event) => {
                        setNewPageTitle(event.target.value);
                        setNewPageSlug(normalizePageSlug(event.target.value));
                      }}
                    />
                  </label>
                  <label className="mt-3 block text-sm">
                    Seiten-URL
                    <span className="mt-1 flex overflow-hidden rounded-xl border bg-white">
                      <span className="border-r bg-slate-100 px-3 py-3 text-slate-500">
                        /
                      </span>
                      <input
                        aria-label="Seiten-URL"
                        className="min-w-0 flex-1 p-3"
                        value={newPageSlug}
                        onChange={(event) =>
                          setNewPageSlug(normalizePageSlug(event.target.value))
                        }
                      />
                    </span>
                  </label>
                  <button
                    className="mt-4 w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
                    disabled={pageCreating}
                    onClick={createPage}
                    type="button"
                  >
                    {pageCreating
                      ? "Seite wird angelegt …"
                      : "Seite als Entwurf anlegen"}
                  </button>
                  <p
                    aria-live="polite"
                    className="mt-2 text-sm font-semibold text-red-700"
                  >
                    {pageCreateError}
                  </p>
                </div>
              ) : null}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold">Bereich hinzufügen</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Inhaltsbereiche übernehmen automatisch deine bereits gepflegten
                Klassen, Fahrzeuge, Teammitglieder und Standorte.
              </p>
              {(["layout", "content"] as const).map((group) => (
                <div className="mt-4" key={group}>
                  <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                    {group === "layout"
                      ? "Texte und Seitenelemente"
                      : "Bereits gepflegte Inhalte"}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(
                      Object.entries(builderBlockCatalog) as [
                        BuilderBlockType,
                        (typeof builderBlockCatalog)[BuilderBlockType],
                      ][]
                    )
                      .filter(([, item]) => item.group === group)
                      .map(([key, item]) => (
                        <button
                          className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold shadow-sm hover:border-cyan-400 hover:bg-cyan-50"
                          key={key}
                          onClick={() => addBlock(key)}
                        >
                          <span className="block">
                            <span className="mr-2 text-cyan-700">＋</span>
                            {item.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 font-normal text-slate-500">
                            {item.description}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </section>
            {blocks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Diese Seite ist noch leer. Wähle oben einfach den gewünschten
                Bereich aus.
              </p>
            ) : null}
            {blocks.map((block, index) => (
              <details
                className={`rounded-2xl border p-4 transition ${draggingBlockId === block.id ? "border-cyan-500 bg-cyan-50 opacity-70" : "border-slate-200"}`}
                draggable
                key={block.id}
                onDragEnd={() => setDraggingBlockId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={(event) => {
                  setDraggingBlockId(block.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", block.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const movingId =
                    draggingBlockId || event.dataTransfer.getData("text/plain");
                  if (movingId)
                    setBlocks((current) =>
                      moveBlockTo(current, movingId, block.id),
                    );
                  setDraggingBlockId(null);
                }}
                onToggle={(event) => {
                  if (event.currentTarget.open) setExpandedBlockId(block.id);
                  else if (expandedBlockId === block.id)
                    setExpandedBlockId(null);
                }}
                open={expandedBlockId === block.id}
              >
                <summary className="cursor-pointer font-semibold">
                  <span aria-hidden="true" className="mr-2 text-slate-400">
                    ⠿
                  </span>
                  {index + 1}.{" "}
                  {builderBlockCatalog[block.properties.type].label}
                  {!block.visible ? " · ausgeblendet" : ""}
                </summary>
                <p className="mt-2 text-xs text-slate-500">
                  Zum Sortieren die Karte ziehen oder die Schaltflächen unten
                  verwenden.
                </p>
                <label className="mt-4 block text-sm">
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
                <BuilderBlockFields
                  properties={block.properties}
                  onPatch={(patch) => patchProperties(block.id, patch)}
                />
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
                <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button
                    aria-label={`${block.properties.heading} nach oben`}
                    className="rounded-lg border px-3 py-2"
                    disabled={index === 0}
                    onClick={() =>
                      setBlocks((current) => moveBlock(current, block.id, -1))
                    }
                  >
                    Nach oben
                  </button>
                  <button
                    aria-label={`${block.properties.heading} nach unten`}
                    className="rounded-lg border px-3 py-2"
                    disabled={index === blocks.length - 1}
                    onClick={() =>
                      setBlocks((current) => moveBlock(current, block.id, 1))
                    }
                  >
                    Nach unten
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
                  <button
                    className="rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50"
                    onClick={() =>
                      setBlocks((current) =>
                        normalizePositions(
                          current.filter((item) => item.id !== block.id),
                        ),
                      )
                    }
                  >
                    Entfernen
                  </button>
                </div>
              </details>
            ))}
            {tenantMode ? (
              <details className="rounded-2xl border border-dashed border-slate-300 p-4">
                <summary className="cursor-pointer font-semibold">
                  Neues Bild hochladen
                </summary>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Das Bild wird optimiert und gleichzeitig im gewählten Bereich
                  deiner Medienbibliothek abgelegt.
                </p>
                <form action={uploadTenantMedia}>
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
              </details>
            ) : null}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-bold tracking-[.16em] text-cyan-800 uppercase">
                Schritt 3
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Vorschau prüfen und veröffentlichen
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Nutze rechts die Geräteansicht. Erst „Veröffentlichen“ übernimmt
                den gespeicherten Entwurf auf die Website.
              </p>
            </div>
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
          <section
            aria-label="Vorschau"
            className={`${workspaceView === "preview" ? "block" : "hidden"} min-w-0 self-start 2xl:sticky 2xl:top-5 2xl:block`}
          >
            <div
              className="mb-3 hidden grid-cols-3 gap-2 sm:grid"
              role="group"
              aria-label="Vorschaugröße"
            >
              {(["desktop", "tablet", "mobile"] as const).map((value) => (
                <button
                  aria-pressed={device === value}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-semibold capitalize ${
                    device === value
                      ? "border-cyan-500 bg-cyan-50 text-cyan-950"
                      : "border-transparent bg-white text-slate-600"
                  }`}
                  key={value}
                  onClick={() => setDevice(value)}
                >
                  {value === "desktop"
                    ? "Desktop"
                    : value === "tablet"
                      ? "Tablet"
                      : "Mobil"}
                </button>
              ))}
            </div>
            <p className="mb-3 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600 sm:hidden">
              Mobile Vorschau
            </p>
            <div
              className={`mx-auto w-full max-w-full overflow-hidden rounded-2xl bg-white shadow-lg transition-[max-width] sm:rounded-3xl ${device === "mobile" ? "sm:max-w-[390px]" : device === "tablet" ? "sm:max-w-[800px]" : "max-w-none"}`}
              data-font={font}
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
