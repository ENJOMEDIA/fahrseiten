import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/config/env";
import { db } from "@/db/client";
import {
  backgroundJobs,
  salesActivities,
  salesEmailTemplates,
  salesLeads,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { salesUnsubscribeUrl } from "./sales-unsubscribe";

const templateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  subjectTemplate: z.string().trim().min(2).max(240),
  bodyTemplate: z.string().trim().min(10).max(20_000),
  active: z.boolean().default(true),
});

const builtinTemplates = [
  {
    id: "builtin-website-impuls",
    name: "Persönlicher Website-Impuls",
    subjectTemplate: "{{Fahrschule}}: moderner Webauftritt ohne Technikstress",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\nviele Fahrschulen leisten täglich starke Arbeit – doch die Website kann mit neuen Kursen, Preisen und Fahrzeugen oft nicht Schritt halten. Genau dafür entwickeln wir FahrSeiten.\n\nIhre Fahrschule erhält einen modernen Auftritt auf der eigenen Domain und ein übersichtliches Dashboard, in dem Inhalte ohne Technikkenntnisse gepflegt werden können.\n\nEin Beispiel finden Sie hier: {{Beispiel-Webseite}}\n\nDarf ich Ihnen in 15 Minuten zeigen, wie FahrSeiten für {{Fahrschule}} aussehen könnte?\n\nFreundliche Grüße\nENJO MEDIA",
    styleKey: "cyan" as const,
  },
  {
    id: "builtin-startup-vision",
    name: "Startup mit Fahrschul-Fokus",
    subjectTemplate: "Wir bauen die digitale Zukunft für Fahrschulen",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\nmit FahrSeiten bauen wir bei ENJO MEDIA eine neue Plattform speziell für Fahrschulen auf – eigenständig entwickelt, einfach bedienbar und mit dem Anspruch, daraus etwas wirklich Großes zu machen.\n\nViele gute Fahrschulen sind online kaum sichtbar oder können ihren Auftritt nur umständlich aktuell halten. FahrSeiten verbindet deshalb Website, Inhalte und Anfragen an einem Ort.\n\nSo kann das aussehen: {{Beispiel-Webseite}}\n\nWir suchen Fahrschulen, die früh dabei sein und die Plattform mit echtem Praxisfeedback mitgestalten möchten. Wäre ein kurzes Kennenlernen interessant?\n\nBeste Grüße\nENJO MEDIA",
    styleKey: "midnight" as const,
  },
  {
    id: "builtin-roadmap",
    name: "Website heute, Plattform morgen",
    subjectTemplate: "Mehr als eine Website für {{Fahrschule}}",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\nFahrSeiten startet mit dem, was sofort zählt: einer schnellen Fahrschulwebsite, eigener Domain, einfach pflegbaren Klassen, Preisen, Kursen, Team, Fuhrpark und Kontaktanfragen.\n\nDarauf bauen wir weiter. Geplant sind unter anderem Fahrstundenplanung, Schülerverwaltung, automatische Erinnerungen und unterstützte Werbekampagnen – Schritt für Schritt in derselben Plattform.\n\nEine Beispiel-Website: {{Beispiel-Webseite}}\n\nWenn Sie Ihren Webauftritt modernisieren und bei der Entwicklung früh mitreden möchten, stelle ich Ihnen FahrSeiten gern persönlich vor.\n\nFreundliche Grüße\nENJO MEDIA",
    styleKey: "sunrise" as const,
  },
].map((template) => ({
  ...template,
  active: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  createdByUserId: null,
}));

export async function listSalesEmailTemplates() {
  const rows = await db
    .select()
    .from(salesEmailTemplates)
    .orderBy(asc(salesEmailTemplates.name));
  return [
    ...builtinTemplates,
    ...rows.filter(
      (row) => !builtinTemplates.some((template) => template.id === row.id),
    ),
  ];
}

export async function saveSalesEmailTemplate(
  raw: unknown,
  actorUserId: string,
) {
  const input = templateSchema.parse(raw);
  const id = createId();
  await db
    .insert(salesEmailTemplates)
    .values({ id, ...input, createdByUserId: actorUserId });
  return id;
}

function replaceTokens(value: string, lead: typeof salesLeads.$inferSelect) {
  const tokens: Record<string, string> = {
    "{{Fahrschule}}": lead.companyName,
    "{{Ansprechpartner}}": lead.contactName || "Fahrschul-Team",
    "{{Webseite}}": lead.website || "",
    "{{Demo-Link}}": new URL("/demo", env.APP_BASE_URL).toString(),
    "{{Vorschau-Link}}": new URL("/demo", env.APP_BASE_URL).toString(),
    "{{Beispiel-Webseite}}": new URL("/demo", env.APP_BASE_URL).toString(),
  };
  return Object.entries(tokens).reduce(
    (result, [token, replacement]) => result.replaceAll(token, replacement),
    value,
  );
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

function renderHtml(
  text: string,
  styleKey: "cyan" | "midnight" | "sunrise" = "cyan",
  unsubscribeUrl: string,
) {
  const styles = {
    cyan: { background: "#ecfeff", accent: "#0891b2", ink: "#0f172a" },
    midnight: { background: "#e2e8f0", accent: "#2563eb", ink: "#020617" },
    sunrise: { background: "#fff7ed", accent: "#ea580c", ink: "#292524" },
  }[styleKey];
  const exampleUrl = new URL("/demo", env.APP_BASE_URL).toString();
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph).replaceAll("\n", "<br>");
      if (!escaped.includes(escapeHtml(exampleUrl)))
        return `<p style="line-height:1.65;margin:0 0 16px">${escaped}</p>`;
      return `<p style="margin:24px 0"><a href="${escapeHtml(exampleUrl)}" style="display:inline-block;background:${styles.accent};color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:999px">Beispiel-Website ansehen</a></p>`;
    })
    .join("");
  return `<div style="background:${styles.background};padding:36px 16px;font-family:Arial,sans-serif;color:${styles.ink}"><div style="max-width:640px;margin:auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.10)"><div style="height:7px;background:${styles.accent}"></div><div style="padding:34px"><div style="font-size:20px;font-weight:800;color:${styles.accent};margin-bottom:26px">FahrSeiten <span style="font-size:12px;color:#64748b">by ENJO MEDIA</span></div>${paragraphs}<div style="font-size:12px;line-height:1.55;color:#64748b;border-top:1px solid #e2e8f0;padding-top:18px;margin-top:26px"><p>Sie erhalten diese Nachricht von ENJO MEDIA auf Grundlage einer dokumentierten Kontaktfreigabe. Sie können weitere Akquise-E-Mails jederzeit ablehnen.</p><p style="margin:16px 0 0"><a href="${escapeHtml(unsubscribeUrl)}" style="display:inline-block;color:#991b1b;font-weight:700;text-decoration:underline">Weitere Akquise-E-Mails abbestellen</a></p></div></div></div></div>`;
}

export async function queueSalesOutreach(input: {
  leadIds: string[];
  templateId: string;
  actorUserId: string;
}) {
  const leadIds = z.array(z.uuid()).min(1).max(100).parse(input.leadIds);
  const builtinTemplate = builtinTemplates.find(
    (template) => template.id === input.templateId,
  );
  const [storedTemplate] = builtinTemplate
    ? []
    : await db
        .select()
        .from(salesEmailTemplates)
        .where(
          and(
            eq(salesEmailTemplates.id, input.templateId),
            eq(salesEmailTemplates.active, true),
          ),
        )
        .limit(1);
  const template = storedTemplate ?? builtinTemplate ?? null;
  if (!template)
    throw new Error(
      "Die E-Mail-Vorlage wurde nicht gefunden oder ist deaktiviert.",
    );
  const leads = await db
    .select()
    .from(salesLeads)
    .where(inArray(salesLeads.id, leadIds));
  if (leads.length !== leadIds.length)
    throw new Error(
      "Mindestens ein ausgewählter Kontakt wurde nicht gefunden.",
    );
  if (leads.some((lead) => !lead.email))
    throw new Error(
      "Alle ausgewählten Kontakte benötigen eine E-Mail-Adresse.",
    );
  if (
    leads.some(
      (lead) =>
        !["consent", "existing_customer"].includes(lead.emailPermission) ||
        lead.emailOptOutAt,
    )
  )
    throw new Error(
      "Für alle ausgewählten Kontakte muss eine dokumentierte E-Mail-Freigabe vorliegen; abgemeldete Kontakte bleiben gesperrt.",
    );
  const now = new Date();
  await db.transaction(async (tx) => {
    for (const lead of leads) {
      const id = createId();
      const subject = replaceTokens(template.subjectTemplate, lead);
      const text = replaceTokens(template.bodyTemplate, lead);
      const unsubscribeUrl = salesUnsubscribeUrl(lead.id);
      await tx.insert(backgroundJobs).values({
        id,
        type: "notification",
        idempotencyKey: `sales:${lead.id}:${id}`,
        payload: {
          to: lead.email!,
          from: env.SMTP_FROM,
          template: "sales_outreach",
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
          },
          values: {
            subject,
            text: `${text}\n\nWeitere Akquise-E-Mails abbestellen: ${unsubscribeUrl}`,
            html: renderHtml(
              text,
              builtinTemplate?.styleKey ?? "cyan",
              unsubscribeUrl,
            ),
          },
        },
        runAt: now,
      });
      await tx
        .update(salesLeads)
        .set({ status: "contacted" })
        .where(eq(salesLeads.id, lead.id));
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: lead.id,
        actorUserId: input.actorUserId,
        activityType: "outreach_queued",
        note: `E-Mail „${template.name}“ wurde zum Versand eingeplant.`,
      });
    }
  });
  return leads.length;
}
