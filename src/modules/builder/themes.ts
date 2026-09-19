export const builderThemeValues = [
  "calm_cyan",
  "urban_night",
  "warm_motion",
] as const;

export type BuilderThemeKey = (typeof builderThemeValues)[number];

export const builderFontValues = [
  "system_sans",
  "friendly_sans",
  "geometric_sans",
  "editorial_serif",
  "classic_serif",
] as const;

export type BuilderFontKey = (typeof builderFontValues)[number];

export const builderFonts: Record<
  BuilderFontKey,
  { name: string; description: string }
> = {
  system_sans: {
    name: "Klar",
    description: "Neutral, vertraut und besonders leicht lesbar.",
  },
  friendly_sans: {
    name: "Freundlich",
    description: "Weicher und persönlicher für eine nahbare Fahrschule.",
  },
  geometric_sans: {
    name: "Präzise",
    description: "Modern, geradlinig und technisch aufgeräumt.",
  },
  editorial_serif: {
    name: "Editorial",
    description: "Markante Serifenschrift für hochwertige Überschriften.",
  },
  classic_serif: {
    name: "Klassisch",
    description: "Ruhige Serifenschrift für einen etablierten Auftritt.",
  },
};

export const builderThemes: Record<
  BuilderThemeKey,
  { name: string; description: string; primary: string; accent: string }
> = {
  calm_cyan: {
    name: "Klar & Modern",
    description:
      "Große Bildbühne, luftige Bereiche und eine ruhige Kartenordnung.",
    primary: "#0891b2",
    accent: "#0f172a",
  },
  urban_night: {
    name: "Urban Drive",
    description: "Dunkle Flächen, kompakter Einstieg und versetzte Karten.",
    primary: "#2563eb",
    accent: "#020617",
  },
  warm_motion: {
    name: "Warm & Nahbar",
    description: "Abgerundete Bildbühne, weiche Flächen und lebendige Karten.",
    primary: "#ea580c",
    accent: "#292524",
  },
};
