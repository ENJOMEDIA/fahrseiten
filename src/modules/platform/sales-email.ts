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
import { findPlatformLogoId } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
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
      "Guten Tag {{Ansprechpartner}},\n\neine Fahrschulwebsite sollte nicht jedes Mal zum Technikprojekt werden, nur weil sich ein Kurs, ein Preis oder ein Fahrzeug ändert. Genau an diesem Punkt setzt FahrSeiten an.\n\nSie bekommen einen hochwertigen Auftritt auf Ihrer eigenen Domain und pflegen die Inhalte später in einem klaren Dashboard selbst. Wenn Sie Unterstützung brauchen, bleibt ENJO MEDIA persönlich erreichbar.\n\nSo kann eine FahrSeite aussehen: {{Beispiel-Webseite}}\n\nWenn Sie mögen, skizziere ich Ihnen in einem kurzen Gespräch, wie der Auftritt von {{Fahrschule}} aufgebaut sein könnte.\n\nBeste Grüße\nEnrico Vogt · ENJO MEDIA",
    styleKey: "cyan" as const,
  },
  {
    id: "builtin-startup-vision",
    name: "Startup mit Fahrschul-Fokus",
    subjectTemplate: "Wir bauen die digitale Zukunft für Fahrschulen",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\nFahrSeiten ist unser neues Produkt für Fahrschulen – eigenständig entwickelt bei ENJO MEDIA und mit einer ziemlich klaren Idee: Ein guter Webauftritt darf im Alltag weder Zeit fressen noch Fachwissen voraussetzen.\n\nDeshalb verbinden wir Website, Inhalte und Anfragen in einer Oberfläche, die auch zwischen Unterricht, Prüfungen und Büroarbeit verständlich bleibt. Wir stehen am Anfang, wollen daraus aber bewusst eine große, langfristige Plattform bauen.\n\nEinen Eindruck bekommen Sie hier: {{Beispiel-Webseite}}\n\nWir suchen gerade Fahrschulen, die früh dabei sein und ihre Praxiserfahrung einbringen möchten. Hätten Sie Lust auf ein unverbindliches Kennenlernen?\n\nViele Grüße\nEnrico Vogt · ENJO MEDIA",
    styleKey: "midnight" as const,
  },
  {
    id: "builtin-roadmap",
    name: "Website heute, Plattform morgen",
    subjectTemplate: "Mehr als eine Website für {{Fahrschule}}",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\nFahrSeiten beginnt dort, wo sofort Entlastung entsteht: bei einer schnellen Website, die Sie selbst aktuell halten können. Klassen, Preise, Kurse, Team, Fuhrpark, Standorte und Anfragen liegen übersichtlich an einem Ort.\n\nUnd die Plattform wächst mit: Fahrstundenplanung, Schülerverwaltung, Erinnerungen und unterstützte Werbekampagnen sind als nächste Ausbaustufen vorgesehen. Sie müssen später also nicht wieder bei null anfangen.\n\nHier können Sie den Ansatz direkt ansehen: {{Beispiel-Webseite}}\n\nWenn das für {{Fahrschule}} interessant klingt, zeige ich Ihnen gern persönlich, was heute schon möglich ist und was als Nächstes kommt.\n\nBeste Grüße\nEnrico Vogt · ENJO MEDIA",
    styleKey: "sunrise" as const,
  },
  {
    id: "builtin-postal-interest",
    name: "Brief-Rückmeldung: Interesse bestätigt",
    subjectTemplate: "{{Fahrschule}}: So kann FahrSeiten für euch aussehen",
    bodyTemplate:
      "Guten Tag {{Ansprechpartner}},\n\ndanke für das Interesse an FahrSeiten und die bestätigte E-Mail-Adresse. Mit FahrSeiten lassen sich Website, Inhalte, Fahrzeuge, Kurse und Anfragen zentral verwalten – ohne Technikstress und auf der eigenen Domain.\n\nJetzt live entdecken: {{Beispiel-Webseite}}\n\nWir melden uns persönlich, um die Anforderungen von {{Fahrschule}} und die nächsten Schritte zu besprechen.\n\nViele Grüße\nENJO MEDIA",
    styleKey: "cyan" as const,
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

export function personalizeSalesText(
  value: string,
  lead: typeof salesLeads.$inferSelect,
) {
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

export function renderSalesEmailHtml(
  text: string,
  styleKey: "cyan" | "midnight" | "sunrise" = "cyan",
  unsubscribeUrl: string,
  logoUrl?: string,
  messageKind: "outreach" | "newsletter" = "outreach",
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
  const logo = logoUrl
    ? `<img alt="FahrSeiten by ENJO MEDIA" src="${escapeHtml(logoUrl)}" style="display:block;max-width:180px;max-height:52px;width:auto;height:auto">`
    : `<div style="font-size:20px;font-weight:800;color:${styles.accent}">FahrSeiten <span style="font-size:12px;color:#64748b">by ENJO MEDIA</span></div>`;
  const permissionText =
    messageKind === "newsletter"
      ? "Sie erhalten diesen FahrSeiten-Newsletter aufgrund Ihrer dokumentierten ausdrücklichen Einwilligung."
      : "Sie erhalten diese Nachricht auf Grundlage einer dokumentierten Kontaktfreigabe.";
  const unsubscribeLabel =
    messageKind === "newsletter"
      ? "Newsletter und weitere Werbe-E-Mails abbestellen"
      : "Keine weiteren Akquise-E-Mails erhalten";
  return `<div style="background:${styles.background};padding:42px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${styles.ink}"><div style="max-width:640px;margin:auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,.12)"><div style="height:8px;background:linear-gradient(90deg,${styles.accent},#67e8f9)"></div><div style="padding:38px 38px 18px"><div style="margin-bottom:30px">${logo}<div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b">Websites für Fahrschulen. Einfach im Alltag.</div></div>${paragraphs}<div style="margin:30px 0 4px;padding:18px 20px;border-radius:18px;background:#f8fafc;font-size:13px;line-height:1.6;color:#334155"><strong style="color:${styles.accent}">Persönlich statt anonym:</strong> Bei Fragen sprechen Sie direkt mit ENJO MEDIA – von der ersten Idee bis zur laufenden Seite.</div><div style="font-size:12px;line-height:1.6;color:#64748b;border-top:1px solid #e2e8f0;padding-top:20px;margin-top:28px"><p>${permissionText}</p><p style="margin:14px 0 0"><a href="${escapeHtml(unsubscribeUrl)}" style="display:inline-block;color:#991b1b;font-weight:700;text-decoration:underline">${unsubscribeLabel}</a></p></div></div><div style="padding:15px 38px 22px;color:#94a3b8;font-size:11px">FahrSeiten · ein Produkt von ENJO MEDIA</div></div></div>`;
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
  const platformLogoId = await findPlatformLogoId();
  const logoUrl = platformLogoId
    ? new URL(mediaPublicUrl(platformLogoId), env.APP_BASE_URL).toString()
    : undefined;
  await db.transaction(async (tx) => {
    for (const lead of leads) {
      const id = createId();
      const subject = personalizeSalesText(template.subjectTemplate, lead);
      const text = personalizeSalesText(template.bodyTemplate, lead);
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
            html: renderSalesEmailHtml(
              text,
              builtinTemplate?.styleKey ?? "cyan",
              unsubscribeUrl,
              logoUrl,
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
