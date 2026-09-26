import "server-only";

import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

import { env } from "@/config/env";
import { db } from "@/db/client";
import {
  backgroundJobs,
  salesActivities,
  salesLeads,
  salesNewsletterCampaigns,
  salesNewsletterRecipients,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { findPlatformLogoId } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";

import { personalizeSalesText, renderSalesEmailHtml } from "./sales-email";
import { salesUnsubscribeUrl } from "./sales-unsubscribe";
import { newsletterRecipientBlockReason } from "./newsletter-policy";

const newsletterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  subjectTemplate: z.string().trim().min(3).max(240),
  bodyTemplate: z.string().trim().min(20).max(20_000),
  styleKey: z.enum(["cyan", "midnight", "sunrise"]),
  leadIds: z.array(z.uuid()).min(1).max(500),
});

export async function listNewsletterRecipients() {
  return db
    .select({
      id: salesLeads.id,
      companyName: salesLeads.companyName,
      contactName: salesLeads.contactName,
      email: salesLeads.email,
      permissionEvidence: salesLeads.emailPermissionEvidence,
    })
    .from(salesLeads)
    .where(
      and(
        eq(salesLeads.emailPermission, "consent"),
        isNotNull(salesLeads.email),
        isNotNull(salesLeads.emailPermissionEvidence),
        isNull(salesLeads.emailOptOutAt),
      ),
    )
    .orderBy(salesLeads.companyName);
}

export async function queueSalesNewsletter(input: {
  name: unknown;
  subjectTemplate: unknown;
  bodyTemplate: unknown;
  styleKey: unknown;
  leadIds: string[];
  actorUserId: string;
}) {
  const parsed = newsletterSchema.parse(input);
  const leads = await db
    .select()
    .from(salesLeads)
    .where(inArray(salesLeads.id, parsed.leadIds));
  if (leads.length !== parsed.leadIds.length)
    throw new Error("Mindestens ein ausgewählter Empfänger fehlt.");
  if (leads.some((lead) => newsletterRecipientBlockReason(lead)))
    throw new Error(
      "Newsletter dürfen nur an Kontakte mit dokumentierter ausdrücklicher Einwilligung und ohne Abmeldung versendet werden.",
    );

  const campaignId = createId();
  const now = new Date();
  const platformLogoId = await findPlatformLogoId();
  const logoUrl = platformLogoId
    ? new URL(mediaPublicUrl(platformLogoId), env.APP_BASE_URL).toString()
    : undefined;

  await db.transaction(async (tx) => {
    await tx.insert(salesNewsletterCampaigns).values({
      id: campaignId,
      name: parsed.name,
      subjectTemplate: parsed.subjectTemplate,
      bodyTemplate: parsed.bodyTemplate,
      styleKey: parsed.styleKey,
      recipientCount: leads.length,
      createdByUserId: input.actorUserId,
      queuedAt: now,
    });

    for (const lead of leads) {
      const jobId = createId();
      const subject = personalizeSalesText(parsed.subjectTemplate, lead);
      const text = personalizeSalesText(parsed.bodyTemplate, lead);
      const unsubscribeUrl = salesUnsubscribeUrl(lead.id);
      await tx.insert(backgroundJobs).values({
        id: jobId,
        type: "notification",
        idempotencyKey: `newsletter:${campaignId}:${lead.id}`,
        payload: {
          to: lead.email!,
          from: env.SMTP_FROM,
          template: "sales_outreach",
          headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
          values: {
            subject,
            text: `${text}\n\nNewsletter und weitere Werbe-E-Mails abbestellen: ${unsubscribeUrl}`,
            html: renderSalesEmailHtml(
              text,
              parsed.styleKey,
              unsubscribeUrl,
              logoUrl,
              "newsletter",
            ),
          },
        },
        runAt: now,
      });
      await tx.insert(salesNewsletterRecipients).values({
        id: createId(),
        campaignId,
        leadId: lead.id,
        jobId,
      });
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: lead.id,
        actorUserId: input.actorUserId,
        activityType: "newsletter_queued",
        note: `Newsletter „${parsed.name}“ wurde zum Versand eingeplant.`,
      });
    }
  });
  return { campaignId, recipientCount: leads.length };
}

export async function listNewsletterCampaigns() {
  const campaigns = await db
    .select()
    .from(salesNewsletterCampaigns)
    .orderBy(desc(salesNewsletterCampaigns.queuedAt))
    .limit(50);
  if (!campaigns.length) return [];
  const recipients = await db
    .select({
      campaignId: salesNewsletterRecipients.campaignId,
      jobStatus: backgroundJobs.status,
    })
    .from(salesNewsletterRecipients)
    .innerJoin(
      backgroundJobs,
      eq(backgroundJobs.id, salesNewsletterRecipients.jobId),
    )
    .where(
      inArray(
        salesNewsletterRecipients.campaignId,
        campaigns.map((campaign) => campaign.id),
      ),
    );
  return campaigns.map((campaign) => {
    const jobs = recipients.filter(
      (recipient) => recipient.campaignId === campaign.id,
    );
    return {
      ...campaign,
      sentCount: jobs.filter((job) => job.jobStatus === "completed").length,
      failedCount: jobs.filter((job) => job.jobStatus === "failed").length,
      pendingCount: jobs.filter((job) =>
        ["pending", "running", "retry"].includes(job.jobStatus),
      ).length,
    };
  });
}
