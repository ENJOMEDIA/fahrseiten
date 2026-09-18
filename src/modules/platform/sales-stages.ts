export const salesStages = [
  "new",
  "contacted",
  "interested",
  "demo",
  "offer",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof salesStages)[number];

export const salesStageLabels: Record<LeadStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  interested: "Interessiert",
  demo: "Präsentation",
  offer: "Angebot",
  won: "Gewonnen",
  lost: "Verloren",
};
