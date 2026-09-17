import { describe, expect, it } from "vitest";

import { resolveRequestContext } from "./request-context";

const base = {
  marketingHosts: ["localhost", "fahrseiten.de"],
  appHosts: ["app.localhost", "app.fahrseiten.de"],
  demoHosts: ["demo.localhost"],
  demoTenantId: "demo-tenant",
};

describe("request context resolution", () => {
  it("separates platform and demo contexts", async () => {
    const findTenantByDomain = async () => null;
    await expect(
      resolveRequestContext({
        ...base,
        hostname: "fahrseiten.de",
        findTenantByDomain,
      }),
    ).resolves.toMatchObject({ kind: "marketing" });
    await expect(
      resolveRequestContext({
        ...base,
        hostname: "app.fahrseiten.de",
        findTenantByDomain,
      }),
    ).resolves.toMatchObject({ kind: "app" });
    await expect(
      resolveRequestContext({
        ...base,
        hostname: "demo.localhost",
        findTenantByDomain,
      }),
    ).resolves.toMatchObject({ kind: "demo", tenantId: "demo-tenant" });
  });

  it("uses only a verified repository match for a tenant", async () => {
    const findTenantByDomain = async (hostname: string) =>
      hostname === "kunde.test"
        ? { tenantId: "tenant-a", domainId: "domain-a", primary: true }
        : null;
    await expect(
      resolveRequestContext({
        ...base,
        hostname: "kunde.test",
        findTenantByDomain,
      }),
    ).resolves.toMatchObject({ kind: "tenant", tenantId: "tenant-a" });
    await expect(
      resolveRequestContext({
        ...base,
        hostname: "unknown.test",
        findTenantByDomain,
      }),
    ).resolves.toEqual({ kind: "unknown", hostname: "unknown.test" });
  });
});
