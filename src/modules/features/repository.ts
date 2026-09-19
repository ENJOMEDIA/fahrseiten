import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  auditLogs,
  featureFlags,
  planFeatures,
  subscriptions,
  tenantFeatures,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import type { FeatureKey, FeatureStatus } from "./catalog";
import { featureCatalog } from "./catalog";
import type { FeatureOverrideRepository, FeatureSources } from "./service";
export async function findFeatureSources(
  tenantId: string,
  key: FeatureKey,
): Promise<FeatureSources | null> {
  const rows = await db
    .select({
      defaultStatus: featureFlags.defaultStatus,
      planStatus: planFeatures.status,
      tenantStatus: tenantFeatures.status,
    })
    .from(featureFlags)
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(
      planFeatures,
      and(
        eq(planFeatures.planId, subscriptions.planId),
        eq(planFeatures.featureId, featureFlags.id),
      ),
    )
    .leftJoin(
      tenantFeatures,
      and(
        eq(tenantFeatures.tenantId, tenantId),
        eq(tenantFeatures.featureId, featureFlags.id),
      ),
    )
    .where(eq(featureFlags.key, key))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    defaultStatus: row.defaultStatus as FeatureStatus,
    planStatus: row.planStatus as FeatureStatus | null,
    tenantStatus: row.tenantStatus as FeatureStatus | null,
  };
}

export async function listTenantFeatureStatuses(tenantId: string) {
  const keys = Object.keys(featureCatalog) as FeatureKey[];
  const rows = await db
    .select({
      key: featureFlags.key,
      defaultStatus: featureFlags.defaultStatus,
      planStatus: planFeatures.status,
      tenantStatus: tenantFeatures.status,
    })
    .from(featureFlags)
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(
      planFeatures,
      and(
        eq(planFeatures.planId, subscriptions.planId),
        eq(planFeatures.featureId, featureFlags.id),
      ),
    )
    .leftJoin(
      tenantFeatures,
      and(
        eq(tenantFeatures.tenantId, tenantId),
        eq(tenantFeatures.featureId, featureFlags.id),
      ),
    );
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return Object.fromEntries(
    keys.map((key) => {
      const row = byKey.get(key);
      return [
        key,
        row
          ? {
              defaultStatus: row.defaultStatus as FeatureStatus,
              planStatus: row.planStatus as FeatureStatus | null,
              tenantStatus: row.tenantStatus as FeatureStatus | null,
            }
          : null,
      ];
    }),
  ) as Record<FeatureKey, FeatureSources | null>;
}
export const dbFeatureOverrideRepository: FeatureOverrideRepository = {
  async setOverride(input) {
    await db.transaction(async (tx) => {
      const feature = await tx
        .select({ id: featureFlags.id })
        .from(featureFlags)
        .where(eq(featureFlags.key, input.featureKey))
        .limit(1);
      if (!feature[0]) throw new Error("Feature nicht gefunden.");
      await tx
        .insert(tenantFeatures)
        .values({
          tenantId: input.tenantId,
          featureId: feature[0].id,
          status: input.status,
          reason: input.reason,
        })
        .onDuplicateKeyUpdate({
          set: { status: input.status, reason: input.reason },
        });
      await tx.insert(auditLogs).values({
        id: createId(),
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        action: "feature.override_changed",
        entityType: "feature",
        entityId: feature[0].id,
        metadata: { status: input.status, reason: input.reason },
      });
    });
  },
};
