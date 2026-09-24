export const TENANT_ONBOARDING_VALIDITY_DAYS = 14;

export function tenantOnboardingExpiry(now = new Date()) {
  return new Date(
    now.getTime() + TENANT_ONBOARDING_VALIDITY_DAYS * 24 * 60 * 60_000,
  );
}
