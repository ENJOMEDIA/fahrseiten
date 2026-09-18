"use client";

import { useState } from "react";

import { builderThemes, type BuilderThemeKey } from "@/modules/builder/themes";

import { TenantSite } from "./tenant-site";
import type { PublishedPage, TenantWebsite } from "./types";

export function DemoSite({
  website,
  page,
  afterContent,
}: {
  website: TenantWebsite;
  page: PublishedPage;
  afterContent?: React.ReactNode;
}) {
  const [themeKey, setThemeKey] = useState<BuilderThemeKey>(
    (website.theme.themeKey as BuilderThemeKey) || "urban_night",
  );
  const theme = builderThemes[themeKey];

  return (
    <>
      <div className="demo-ribbon relative z-50 bg-slate-950 px-4 py-2.5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-bold">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400" />
            Interaktive FahrSeiten-Demo{" "}
            <span className="ml-2 font-medium text-white/50">
              · fiktive Inhalte
            </span>
          </p>
          <p className="font-medium text-white/60">
            Mit denselben Bausteinen und Themes wie im Kunden-Builder erstellt
          </p>
        </div>
      </div>
      <TenantSite
        afterContent={afterContent}
        page={page}
        website={{
          ...website,
          theme: {
            ...website.theme,
            themeKey,
            primaryColor: theme.primary,
            accentColor: theme.accent,
          },
        }}
      />
      <aside
        aria-label="Demo-Theme auswählen"
        className="demo-theme-switcher fixed right-3 bottom-3 z-50 w-[min(25rem,calc(100vw-1.5rem))] rounded-3xl border border-white/15 bg-slate-950/92 p-3 text-white shadow-2xl backdrop-blur-2xl sm:right-5 sm:bottom-5"
      >
        <div className="flex items-center justify-between gap-3 px-2 pb-2">
          <div>
            <p className="text-[0.64rem] font-black tracking-[0.2em] text-white/45 uppercase">
              Live ausprobieren
            </p>
            <p className="text-sm font-black">Website-Theme wechseln</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold text-white/55">
            Builder-Feature
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(builderThemes) as BuilderThemeKey[]).map((key) => {
            const item = builderThemes[key];
            return (
              <button
                aria-pressed={themeKey === key}
                className="rounded-2xl border border-white/10 px-2 py-2.5 text-left transition hover:bg-white/10 aria-pressed:border-white/40 aria-pressed:bg-white/15"
                key={key}
                onClick={() => setThemeKey(key)}
                type="button"
              >
                <span className="mb-2 flex gap-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.primary }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: item.accent }}
                  />
                </span>
                <span className="block text-[0.68rem] leading-tight font-black">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
