import type { FeatureKey, FeatureStatus } from "./catalog";
export type FeatureSources = {
  defaultStatus: FeatureStatus;
  planStatus?: FeatureStatus | null;
  tenantStatus?: FeatureStatus | null;
};
export function resolveFeatureStatus(sources: FeatureSources): FeatureStatus {
  return sources.tenantStatus ?? sources.planStatus ?? sources.defaultStatus;
}
export function isFeatureUsable(status: FeatureStatus) {
  return status === "enabled" || status === "beta";
}
export function canCreateLocation(
  existingLocations: number,
  multiLocation: boolean,
) {
  return existingLocations === 0 || multiLocation;
}
export function supportPriority(prioritySupport: boolean) {
  return prioritySupport ? ("high" as const) : ("normal" as const);
}
export function requireFeature(key: FeatureKey, sources: FeatureSources) {
  const status = resolveFeatureStatus(sources);
  if (!isFeatureUsable(status))
    throw new Error(`Feature nicht verfügbar: ${key}`);
  return status;
}
export interface FeatureOverrideRepository {
  setOverride(input: {
    tenantId: string;
    featureKey: FeatureKey;
    status: FeatureStatus;
    actorUserId: string;
    reason: string;
  }): Promise<void>;
}
export async function setTenantFeatureOverride(input: {
  allowed: boolean;
  tenantId: string;
  featureKey: FeatureKey;
  status: FeatureStatus;
  actorUserId: string;
  reason: string;
  repository: FeatureOverrideRepository;
}) {
  if (!input.allowed)
    throw new Error("Keine Berechtigung für Feature-Freischaltungen.");
  if (input.reason.trim().length < 5)
    throw new Error("Eine nachvollziehbare Begründung ist erforderlich.");
  await input.repository.setOverride(input);
}
