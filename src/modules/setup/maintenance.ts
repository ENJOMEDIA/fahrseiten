import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { auditLogs, platformSettings, sites } from "@/db/schema";
import {
  platformHasPublishedLegalDocuments,
  tenantHasPublishedLegalDocuments,
} from "@/modules/legal/repository";
import type { TenantContext } from "@/modules/tenancy/tenant-context";

const maintenanceInput = z.object({
  enabled: z.boolean(),
  message: z.string().trim().min(10).max(500),
  demoAvailableDuringMaintenance: z.boolean().optional(),
});

export async function updatePlatformMaintenance(input: {
  enabled: boolean;
  message: string;
  actorUserId: string;
  demoAvailableDuringMaintenance: boolean;
}) {
  const parsed = maintenanceInput.parse(input);
  const [settings] = await db
    .select({ id: platformSettings.id })
    .from(platformSettings)
    .limit(1);
  if (!settings)
    throw new Error("Die Plattform wurde noch nicht eingerichtet.");
  if (!parsed.enabled && !(await platformHasPublishedLegalDocuments())) {
    throw new Error(
      "Impressum, Datenschutz und B2B-AGB müssen vor der Freischaltung veröffentlicht sein.",
    );
  }
  await db.transaction(async (tx) => {
    await tx
      .update(platformSettings)
      .set({
        maintenanceMode: parsed.enabled,
        maintenanceMessage: parsed.message,
        demoAvailableDuringMaintenance:
          parsed.demoAvailableDuringMaintenance ?? true,
      })
      .where(eq(platformSettings.id, settings.id));
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: input.actorUserId,
      action: parsed.enabled
        ? "platform.maintenance.enabled"
        : "platform.maintenance.disabled",
      entityType: "platform",
      entityId: settings.id,
    });
  });
}

export async function findTenantMaintenance(context: TenantContext) {
  const [site] = await db
    .select({
      maintenanceMode: sites.maintenanceMode,
      maintenanceMessage: sites.maintenanceMessage,
    })
    .from(sites)
    .where(eq(sites.tenantId, context.tenantId))
    .limit(1);
  return site ?? null;
}

export async function updateTenantMaintenance(
  context: TenantContext,
  input: { enabled: boolean; message: string },
) {
  const parsed = maintenanceInput.parse(input);
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.tenantId, context.tenantId))
    .limit(1);
  if (!site) throw new Error("Für den Mandanten wurde keine Website angelegt.");
  if (!parsed.enabled) {
    const legalReady = await tenantHasPublishedLegalDocuments(context.tenantId);
    if (!legalReady) {
      throw new Error(
        "Impressum und Datenschutz müssen vor der Freischaltung veröffentlicht sein.",
      );
    }
  }
  await db.transaction(async (tx) => {
    await tx
      .update(sites)
      .set({
        maintenanceMode: parsed.enabled,
        maintenanceMessage: parsed.message,
      })
      .where(and(eq(sites.id, site.id), eq(sites.tenantId, context.tenantId)));
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: parsed.enabled
        ? "tenant.maintenance.enabled"
        : "tenant.maintenance.disabled",
      entityType: "site",
      entityId: site.id,
    });
  });
}
