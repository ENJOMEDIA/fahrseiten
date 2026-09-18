export const builderThemeValues = [
  "calm_cyan",
  "urban_night",
  "warm_motion",
] as const;

export type BuilderThemeKey = (typeof builderThemeValues)[number];

export const builderThemes: Record<
  BuilderThemeKey,
  { name: string; description: string; primary: string; accent: string }
> = {
  calm_cyan: {
    name: "Klar & Modern",
    description: "Ruhige Flächen, klare Struktur und frisches Cyan.",
    primary: "#0891b2",
    accent: "#0f172a",
  },
  urban_night: {
    name: "Urban Drive",
    description: "Kontrastreich, direkt und auf moderne Fahrschulen ausgelegt.",
    primary: "#2563eb",
    accent: "#020617",
  },
  warm_motion: {
    name: "Warm & Nahbar",
    description: "Freundliche Akzente für einen persönlichen Auftritt.",
    primary: "#ea580c",
    accent: "#292524",
  },
};
