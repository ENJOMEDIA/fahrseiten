import { z } from "zod";
export type RenderedEmail = { subject: string; text: string; html: string };
const valuesSchema = z.object({
  headline: z.string().min(1).max(180),
  actionUrl: z.url().optional(),
  reference: z.string().min(1).max(100),
});
const definitions = {
  contact_inquiry_received: {
    version: 1,
    render: (v: z.infer<typeof valuesSchema>): RenderedEmail => ({
      subject: `Neue Anfrage · ${v.reference}`,
      text: `${v.headline}\nReferenz: ${v.reference}`,
      html: `<h1>${escapeHtml(v.headline)}</h1><p>Referenz: ${escapeHtml(v.reference)}</p>`,
    }),
  },
  password_reset: {
    version: 1,
    render: (v: z.infer<typeof valuesSchema>): RenderedEmail => ({
      subject: "Passwort zurücksetzen",
      text: `${v.headline}\n${v.actionUrl ?? ""}`,
      html: `<h1>${escapeHtml(v.headline)}</h1><p><a href="${escapeHtml(v.actionUrl ?? "")}">Passwort zurücksetzen</a></p>`,
    }),
  },
  user_invitation: {
    version: 1,
    render: (v: z.infer<typeof valuesSchema>): RenderedEmail => ({
      subject: "Einladung zu FahrSeiten",
      text: `${v.headline}\n${v.actionUrl ?? ""}`,
      html: `<h1>${escapeHtml(v.headline)}</h1><p><a href="${escapeHtml(v.actionUrl ?? "")}">Einladung öffnen</a></p>`,
    }),
  },
  follow_up_due: {
    version: 1,
    render: (v: z.infer<typeof valuesSchema>): RenderedEmail => ({
      subject: `Wiedervorlage · ${v.reference}`,
      text: v.headline,
      html: `<h1>${escapeHtml(v.headline)}</h1>`,
    }),
  },
} as const;
export type TemplateKey = keyof typeof definitions;
export function renderEmailTemplate(key: TemplateKey, values: unknown) {
  const parsed = valuesSchema.parse(values);
  return {
    version: definitions[key].version,
    ...definitions[key].render(parsed),
  };
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ]!,
  );
}
