import { describe, expect, it } from "vitest";

import {
  TENANT_ONBOARDING_VALIDITY_DAYS,
  tenantOnboardingExpiry,
} from "./onboarding-policy";

describe("tenant onboarding policy", () => {
  it("keeps new and resent setup links valid for 14 days", () => {
    const now = new Date("2026-09-24T12:00:00.000Z");

    expect(TENANT_ONBOARDING_VALIDITY_DAYS).toBe(14);
    expect(tenantOnboardingExpiry(now).toISOString()).toBe(
      "2026-10-08T12:00:00.000Z",
    );
  });
});
