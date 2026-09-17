import { describe, expect, it } from "vitest";

import { hasPlatformPermission, hasTenantPermission } from "./permissions";

describe("permissions", () => {
  it("keeps platform roles separate", () => {
    expect(
      hasPlatformPermission("platform_owner", "platform.security.manage"),
    ).toBe(true);
    expect(
      hasPlatformPermission("platform_sales", "platform.security.manage"),
    ).toBe(false);
    expect(
      hasPlatformPermission("platform_support", "platform.tenants.manage"),
    ).toBe(false);
  });

  it("limits tenant roles", () => {
    expect(hasTenantPermission("tenant_owner", "tenant.members.manage")).toBe(
      true,
    );
    expect(hasTenantPermission("tenant_editor", "tenant.members.manage")).toBe(
      false,
    );
    expect(hasTenantPermission("tenant_viewer", "tenant.content.write")).toBe(
      false,
    );
    expect(hasTenantPermission("tenant_viewer", "tenant.content.read")).toBe(
      true,
    );
  });
});
