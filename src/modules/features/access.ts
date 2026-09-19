import "server-only";

import type { FeatureKey, FeatureStatus } from "./catalog";
import { findFeatureSources, listTenantFeatureStatuses } from "./repository";
import { isFeatureUsable, resolveFeatureStatus } from "./service";

export class FeatureAccessError extends Error {
  constructor(public readonly featureKey: FeatureKey) {
    super(
      `Diese Funktion ist im aktuellen Paket nicht freigeschaltet: ${featureKey}`,
    );
    this.name = "FeatureAccessError";
  }
}

export async function getTenantFeatureStatus(
  tenantId: string,
  key: FeatureKey,
): Promise<FeatureStatus> {
  const sources = await findFeatureSources(tenantId, key);
  return sources ? resolveFeatureStatus(sources) : "unavailable";
}

export async function isTenantFeatureEnabled(
  tenantId: string,
  key: FeatureKey,
) {
  return isFeatureUsable(await getTenantFeatureStatus(tenantId, key));
}

export async function assertTenantFeature(tenantId: string, key: FeatureKey) {
  const status = await getTenantFeatureStatus(tenantId, key);
  if (!isFeatureUsable(status)) throw new FeatureAccessError(key);
  return status;
}

export async function getTenantFeatureStatusMap(tenantId: string) {
  const sources = await listTenantFeatureStatuses(tenantId);
  return Object.fromEntries(
    Object.entries(sources).map(([key, value]) => [
      key,
      value ? resolveFeatureStatus(value) : "unavailable",
    ]),
  ) as Record<FeatureKey, FeatureStatus>;
}
