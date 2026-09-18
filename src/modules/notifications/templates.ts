import { z } from "zod";
export type RenderedEmail = { subject: string; text: string; html: string };
const valuesSchema = z.object({
  headline: z.string().min(1).max(180),
  actionUrl: z.url().optional(),
  reference: z.string().min(1).max(100),
});
const salesValuesSchema = z.object({
  subject: z.string().min(1).max(240),
  text: z.string().min(1).max(20_000),
  html: z.string().min(1).max(50_000),
});
const instanceInvitationValuesSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(160),
  actionUrl: z.url(),
  expiresInDays: z.number().int().min(1).max(30),
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
  instance_invitation: {
    version: 1,
    render: (
      v: z.infer<typeof instanceInvitationValuesSchema>,
    ): RenderedEmail => ({
      subject: `Ihre FahrSeiten-Instanz für ${v.companyName}`,
      text: `Guten Tag ${v.contactName},\n\nwir haben die Einrichtung Ihrer FahrSeiten-Instanz vorbereitet. Über den folgenden persönlichen Einmal-Link ergänzen Sie die noch fehlenden Stammdaten, legen Ihr Passwort fest und wählen die ersten Farben Ihrer Website.\n\n${v.actionUrl}\n\nDer Link ist ${v.expiresInDays} Tage gültig und kann einmal verwendet werden. Halten Sie bitte Anschrift, Domain, Kontaktdaten und rechtliche Pflichtangaben bereit. Danach startet Ihre Website geschützt im Wartungsmodus.\n\nViele Grüße\nFahrSeiten – by ENJO MEDIA`,
      html: `<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.10)"><div style="height:7px;background:#0891b2"></div><div style="padding:34px"><p style="font-size:20px;font-weight:800;color:#0891b2">FahrSeiten <span style="font-size:12px;color:#64748b">by ENJO MEDIA</span></p><h1 style="font-size:28px;line-height:1.2;margin:28px 0 16px">Ihre Instanz ist vorbereitet.</h1><p style="line-height:1.65">Guten Tag ${escapeHtml(v.contactName)},</p><p style="line-height:1.65">wir haben die Einrichtung für <strong>${escapeHtml(v.companyName)}</strong> vorbereitet. Ergänzen Sie die noch fehlenden Stammdaten, legen Sie Ihr Passwort fest und wählen Sie die ersten Farben Ihrer Website.</p><p style="margin:28px 0"><a href="${escapeHtml(v.actionUrl)}" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px">Instanz fertig einrichten</a></p><p style="line-height:1.65;color:#475569">Der persönliche Link ist ${v.expiresInDays} Tage gültig und kann einmal verwendet werden. Halten Sie bitte Anschrift, Domain, Kontaktdaten und rechtliche Pflichtangaben bereit. Danach startet die Website geschützt im Wartungsmodus.</p><p style="line-height:1.65;margin-top:26px">Viele Grüße<br><strong>FahrSeiten – by ENJO MEDIA</strong></p></div></div></div>`,
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
export type DeliveryTemplateKey = TemplateKey | "sales_outreach";
export function renderEmailTemplate(key: DeliveryTemplateKey, values: unknown) {
  if (key === "sales_outreach") {
    const parsed = salesValuesSchema.parse(values);
    return { version: 1, ...parsed };
  }
  if (key === "instance_invitation") {
    const parsed = instanceInvitationValuesSchema.parse(values);
    return {
      version: definitions[key].version,
      ...definitions[key].render(parsed),
    };
  }
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
