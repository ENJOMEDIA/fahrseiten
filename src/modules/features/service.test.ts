import { describe, expect, it, vi } from "vitest";
import {
  requireFeature,
  resolveFeatureStatus,
  setTenantFeatureOverride,
} from "./service";
describe("feature resolution", () => {
  it("uses tenant override before plan and default", () => {
    expect(
      resolveFeatureStatus({
        defaultStatus: "unavailable",
        planStatus: "coming_soon",
        tenantStatus: "beta",
      }),
    ).toBe("beta");
  });
  it("blocks direct use unless enabled or beta", () => {
    expect(() =>
      requireFeature("payments", { defaultStatus: "coming_soon" }),
    ).toThrow(/nicht verfügbar/);
    expect(
      requireFeature("website_builder", { defaultStatus: "enabled" }),
    ).toBe("enabled");
  });
  it("requires platform permission and records controlled overrides", async () => {
    const setOverride = vi.fn(async () => {});
    await expect(
      setTenantFeatureOverride({
        allowed: false,
        tenantId: "tenant-1",
        featureKey: "sms",
        status: "beta",
        actorUserId: "sales-1",
        reason: "Pilotphase",
        repository: { setOverride },
      }),
    ).rejects.toThrow(/Berechtigung/);
    await setTenantFeatureOverride({
      allowed: true,
      tenantId: "tenant-1",
      featureKey: "sms",
      status: "beta",
      actorUserId: "owner-1",
      reason: "Freigegebener Test",
      repository: { setOverride },
    });
    expect(setOverride).toHaveBeenCalledOnce();
  });
});
