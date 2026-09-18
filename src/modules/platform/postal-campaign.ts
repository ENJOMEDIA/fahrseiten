import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, like, ne } from "drizzle-orm";
import { z } from "zod";

import { env } from "@/config/env";
import { db } from "@/db/client";
import { backgroundJobs, salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import { salesUnsubscribeUrl } from "./sales-unsubscribe";
import {
  createPostalCampaignUrl,
  verifyPostalCampaignToken,
} from "./postal-campaign-token";

export const POSTAL_CONSENT_VERSION = "postal-email-consent-v1";
export const postalResponseValues = [
  "interested",
  "unsure",
  "declined",
] as const;
export type PostalResponse = (typeof postalResponseValues)[number];

function secret() {
  if (!env.CRON_SECRET)
    throw new Error("CRON_SECRET fehlt für sichere Akquise-Links.");
  return env.CRON_SECRET;
}

export function postalCampaignUrl(leadId: string) {
  return createPostalCampaignUrl(leadId, env.APP_BASE_URL, secret());
}

export async function findPostalCampaignLead(leadId: string, token: string) {
  if (!verifyPostalCampaignToken(leadId, token, secret())) return null;
  const [lead] = await db
    .select({
      id: salesLeads.id,
      companyName: salesLeads.companyName,
      response: salesLeads.postalResponse,
    })
    .from(salesLeads)
    .where(eq(salesLeads.id, leadId))
    .limit(1);
  return lead ?? null;
}

const responseSchema = z
  .object({
    leadId: z.uuid(),
    token: z.string().regex(/^[a-f0-9]{64}$/),
    response: z.enum(postalResponseValues),
    email: z.union([z.literal(""), z.email()]),
    acknowledged: z.literal(true),
    emailConsent: z.boolean(),
  })
  .superRefine((value, context) => {
    if (
      value.response !== "declined" &&
      (!value.email || !value.emailConsent)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Bitte E-Mail-Adresse und Einwilligung vollständig bestätigen.",
      });
    }
  });

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function emailHtml(input: {
  heading: string;
  text: string;
  actionUrl: string;
  action: string;
  unsubscribeUrl?: string;
}) {
  const footer = input.unsubscribeUrl
    ? `<p style="margin:28px 0 0;border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;color:#64748b">Du kannst weitere E-Mails jederzeit <a href="${input.unsubscribeUrl}" style="color:#991b1b;font-weight:700">abbestellen</a>.</p>`
    : "";
  return `<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:auto;background:#fff;border-radius:24px;overflow:hidden"><div style="height:7px;background:#22d3ee"></div><div style="padding:34px"><p style="font-size:20px;font-weight:800;margin:0 0 24px">FahrSeiten <span style="font-size:12px;color:#64748b">by ENJO MEDIA</span></p><h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">${input.heading}</h1><p style="line-height:1.65;color:#475569">${input.text}</p><p style="margin:26px 0 0"><a href="${input.actionUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:999px">${input.action}</a></p>${footer}</div></div></div>`;
}

export async function submitPostalCampaignResponse(raw: unknown) {
  const input = responseSchema.parse(raw);
  if (!verifyPostalCampaignToken(input.leadId, input.token, secret())) {
    throw new Error("Der persönliche Akquise-Link ist ungültig.");
  }
  const [lead] = await db
    .select()
    .from(salesLeads)
    .where(eq(salesLeads.id, input.leadId))
    .limit(1);
  if (!lead) throw new Error("Der zugehörige Kontakt wurde nicht gefunden.");
  if (lead.postalResponse)
    throw new Error("Die Auswahl wurde bereits gespeichert.");

  const now = new Date();
  if (input.response === "declined") {
    await db.transaction(async (tx) => {
      await tx
        .update(salesLeads)
        .set({
          postalResponse: "declined",
          postalResponseAt: now,
          emailPermission: "withdrawn",
          emailOptOutAt: now,
          status: "lost",
          lossReason: "Kein Interesse nach postalischer Ansprache",
          nextTaskAt: null,
        })
        .where(eq(salesLeads.id, lead.id));
      await tx
        .delete(backgroundJobs)
        .where(
          and(
            like(backgroundJobs.idempotencyKey, `sales:${lead.id}:%`),
            ne(backgroundJobs.status, "completed"),
          ),
        );
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: lead.id,
        activityType: "postal_response_declined",
        note: "Weitere werbliche Kontaktaufnahme wurde abgelehnt und dauerhaft gesperrt.",
      });
    });
    return { response: input.response };
  }

  const confirmationToken = randomBytes(32).toString("hex");
  const confirmationHash = tokenHash(confirmationToken);
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const confirmationUrl = new URL("/brief/bestaetigen", env.APP_BASE_URL);
  confirmationUrl.searchParams.set("lead", lead.id);
  confirmationUrl.searchParams.set("token", confirmationToken);
  const jobId = createId();
  await db.transaction(async (tx) => {
    await tx
      .update(salesLeads)
      .set({
        postalResponse: input.response,
        postalResponseAt: now,
        postalResponseEmail: input.email.toLowerCase(),
        postalConsentTextVersion: POSTAL_CONSENT_VERSION,
        postalConfirmationTokenHash: confirmationHash,
        postalConfirmationExpiresAt: expiresAt,
        emailPermission: "unknown",
      })
      .where(eq(salesLeads.id, lead.id));
    await tx.insert(backgroundJobs).values({
      id: jobId,
      type: "notification",
      idempotencyKey: `postal-consent:${lead.id}:${confirmationHash.slice(0, 16)}`,
      payload: {
        to: input.email.toLowerCase(),
        from: env.SMTP_FROM,
        template: "sales_outreach",
        values: {
          subject: "Bitte bestätige deine FahrSeiten-Anfrage",
          text: `Du hast über unseren persönlichen Brief-Link Informationen zu FahrSeiten angefordert. Bestätige bitte einmalig deine E-Mail-Adresse:\n\n${confirmationUrl.toString()}\n\nOhne Bestätigung senden wir keine weiteren E-Mails.`,
          html: emailHtml({
            heading: "Nur noch einmal bestätigen",
            text: "Du hast Informationen zu FahrSeiten angefordert. Bestätige bitte einmalig deine E-Mail-Adresse. Ohne Bestätigung senden wir keine weiteren E-Mails.",
            actionUrl: confirmationUrl.toString(),
            action: "E-Mail-Adresse bestätigen",
          }),
        },
      },
    });
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: lead.id,
      activityType: "postal_response_pending",
      note:
        input.response === "interested"
          ? "Interesse gemeldet; Double-Opt-in wartet auf Bestätigung."
          : "Weitere Informationen angefordert; Double-Opt-in wartet auf Bestätigung.",
    });
  });
  return { response: input.response };
}

export async function verifyPostalConfirmation(leadId: string, token: string) {
  if (!z.uuid().safeParse(leadId).success || !/^[a-f0-9]{64}$/.test(token))
    return false;
  const [lead] = await db
    .select({ id: salesLeads.id })
    .from(salesLeads)
    .where(
      and(
        eq(salesLeads.id, leadId),
        eq(salesLeads.postalConfirmationTokenHash, tokenHash(token)),
        gt(salesLeads.postalConfirmationExpiresAt, new Date()),
      ),
    )
    .limit(1);
  return Boolean(lead);
}

export async function confirmPostalEmail(leadId: string, token: string) {
  if (!(await verifyPostalConfirmation(leadId, token))) {
    throw new Error("Der Bestätigungslink ist ungültig oder abgelaufen.");
  }
  const [lead] = await db
    .select()
    .from(salesLeads)
    .where(eq(salesLeads.id, leadId))
    .limit(1);
  if (!lead?.postalResponseEmail) throw new Error("E-Mail-Adresse fehlt.");
  const now = new Date();
  const unsubscribeUrl = salesUnsubscribeUrl(lead.id);
  const exampleUrl = new URL("/demo", env.APP_BASE_URL).toString();
  const jobId = createId();
  await db.transaction(async (tx) => {
    await tx
      .update(salesLeads)
      .set({
        email: lead.postalResponseEmail,
        emailPermission: "consent",
        emailPermissionEvidence: `Double-Opt-in über postalische Akquise-Landingpage; Textversion ${POSTAL_CONSENT_VERSION}`,
        emailPermissionAt: now,
        emailOptOutAt: null,
        postalConfirmedAt: now,
        postalConfirmationTokenHash: null,
        postalConfirmationExpiresAt: null,
        status:
          lead.postalResponse === "interested" ? "interested" : "contacted",
        nextTaskAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      })
      .where(eq(salesLeads.id, lead.id));
    await tx.insert(backgroundJobs).values({
      id: jobId,
      type: "notification",
      idempotencyKey: `postal-welcome:${lead.id}`,
      payload: {
        to: lead.postalResponseEmail,
        from: env.SMTP_FROM,
        template: "sales_outreach",
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
        values: {
          subject: `${lead.companyName}: So kann FahrSeiten für euch aussehen`,
          text: `Danke für dein Interesse an FahrSeiten. Websites, Inhalte, Fahrzeuge, Kurse und Anfragen lassen sich zentral und ohne Technikstress verwalten.\n\nEntdecke jetzt, wie eine FahrSeiten-Website aussehen kann: ${exampleUrl}\n\nWir melden uns persönlich, um Anforderungen und nächste Schritte zu besprechen.\n\nWeitere E-Mails abbestellen: ${unsubscribeUrl}`,
          html: emailHtml({
            heading: "Bereit für eine Website, die einfach mitfährt?",
            text: "Danke für dein Interesse. Mit FahrSeiten verwaltest du Website, Inhalte, Fahrzeuge, Kurse und Anfragen zentral – ohne Technikstress. Entdecke jetzt, was für deine Fahrschule möglich ist.",
            actionUrl: exampleUrl,
            action: "FahrSeiten live entdecken",
            unsubscribeUrl,
          }),
        },
      },
    });
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: lead.id,
      activityType: "postal_email_confirmed",
      note: "Double-Opt-in bestätigt; Informationsmail eingeplant und Wiedervorlage gesetzt.",
    });
  });
}
