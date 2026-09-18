import "server-only";

import { and, eq, like, ne } from "drizzle-orm";

import { env } from "@/config/env";
import { db } from "@/db/client";
import { backgroundJobs, salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import {
  createSalesUnsubscribeUrl,
  verifySalesUnsubscribeTokenValue,
} from "@/modules/platform/sales-unsubscribe-token";

function unsubscribeSecret() {
  if (!env.CRON_SECRET)
    throw new Error("CRON_SECRET fehlt für sichere Abmeldelinks.");
  return env.CRON_SECRET;
}

export function salesUnsubscribeUrl(leadId: string) {
  return createSalesUnsubscribeUrl(
    leadId,
    env.APP_BASE_URL,
    unsubscribeSecret(),
  );
}

export function verifySalesUnsubscribeToken(leadId: string, token: string) {
  return verifySalesUnsubscribeTokenValue(leadId, token, unsubscribeSecret());
}

export async function unsubscribeSalesLead(leadId: string, token: string) {
  if (!verifySalesUnsubscribeToken(leadId, token))
    throw new Error("Der Abmeldelink ist ungültig.");
  const now = new Date();
  return db.transaction(async (tx) => {
    const [lead] = await tx
      .select({ id: salesLeads.id, companyName: salesLeads.companyName })
      .from(salesLeads)
      .where(eq(salesLeads.id, leadId))
      .limit(1);
    if (!lead) throw new Error("Der Kontakt wurde nicht gefunden.");
    await tx
      .update(salesLeads)
      .set({
        emailPermission: "withdrawn",
        emailOptOutAt: now,
        nextTaskAt: null,
      })
      .where(eq(salesLeads.id, leadId));
    await tx
      .delete(backgroundJobs)
      .where(
        and(
          like(backgroundJobs.idempotencyKey, `sales:${leadId}:%`),
          ne(backgroundJobs.status, "completed"),
        ),
      );
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId,
      activityType: "email_opt_out",
      note: "Der Kontakt hat weitere Akquise-E-Mails abbestellt.",
    });
    return lead;
  });
}
