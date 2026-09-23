import "server-only";
import { db } from "@/db/client";
import { salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import type { SalesLeadRepository } from "./lead-service";
import { recordLeadReferral } from "@/modules/referrals/service";
export const dbSalesLeadRepository: SalesLeadRepository = {
  async create(record) {
    await db.transaction(async (tx) => {
      await tx.insert(salesLeads).values({
        id: record.id,
        companyName: record.companyName,
        contactName: record.contactName,
        email: record.email,
        phone: record.phone,
        website: record.websiteUrl,
        source: record.source,
        privacyTextVersion: record.privacyTextVersion,
        status: record.status,
      });
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: record.id,
        activityType: "marketing_inquiry",
        note: record.message,
      });
      if (record.referralCode)
        await recordLeadReferral(tx, {
          leadId: record.id,
          code: record.referralCode,
          disclosureAccepted: record.referralDisclosureAccepted === true,
          disclosureVersion: record.referralTermsVersion ?? "",
          confirmedAt: record.createdAt,
        });
    });
  },
};
