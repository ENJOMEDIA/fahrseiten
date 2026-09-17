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

const templateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  subjectTemplate: z.string().trim().min(2).max(240),
  bodyTemplate: z.string().trim().min(10).max(20_000),
  active: z.boolean().default(true),
});

const defaultTemplate = {
  id: "default",
  name: "Persönliche Demo-Einladung",
  subjectTemplate: "Eine moderne Website für {{Fahrschule}}",
  bodyTemplate:
    "Guten Tag {{Ansprechpartner}},\n\nwir haben uns den Webauftritt von {{Fahrschule}} angesehen. Mit FahrSeiten lassen sich Inhalte, Kurse, Preise und Fahrzeuge ohne Technikkenntnisse aktuell halten.\n\nEine vollständige Beispielseite finden Sie hier: {{Demo-Link}}\n\nWenn das interessant klingt, antworte ich gern persönlich auf Ihre Fragen.\n\nFreundliche Grüße\nENJO MEDIA",
  active: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  createdByUserId: null,
};

export async function listSalesEmailTemplates() {
  const rows = await db
    .select()
    .from(salesEmailTemplates)
    .orderBy(asc(salesEmailTemplates.name));
  return rows.length ? rows : [defaultTemplate];
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

function renderHtml(text: string) {
  return `<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:auto;background:#fff;border-radius:20px;padding:32px"><div style="font-weight:800;color:#0891b2;margin-bottom:24px">FahrSeiten · by ENJO MEDIA</div>${text
    .split(/\n\n+/)
    .map(
      (paragraph) =>
        `<p style="line-height:1.65;margin:0 0 16px">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join(
      "",
    )}<p style="font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:18px">Sie erhalten diese persönliche Geschäftsanfrage von ENJO MEDIA. Wenn Sie keine weiteren Informationen wünschen, genügt eine kurze Antwort.</p></div></div>`;
}

export async function queueSalesOutreach(input: {
  leadIds: string[];
  templateId: string;
  actorUserId: string;
}) {
  const leadIds = z.array(z.uuid()).min(1).max(100).parse(input.leadIds);
  const [storedTemplate] =
    input.templateId === "default"
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
  const template =
    storedTemplate ?? (input.templateId === "default" ? defaultTemplate : null);
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
  const now = new Date();
  await db.transaction(async (tx) => {
    for (const lead of leads) {
      const id = createId();
      const subject = replaceTokens(template.subjectTemplate, lead);
      const text = replaceTokens(template.bodyTemplate, lead);
      await tx.insert(backgroundJobs).values({
        id,
        type: "notification",
        idempotencyKey: `sales:${lead.id}:${id}`,
        payload: {
          to: lead.email!,
          from: env.SMTP_FROM,
          template: "sales_outreach",
          values: { subject, text, html: renderHtml(text) },
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
