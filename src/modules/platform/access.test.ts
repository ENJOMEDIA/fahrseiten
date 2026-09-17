import { describe, expect, it } from "vitest";
import { hasPlatformPermission } from "@/modules/auth/permissions";
describe("platform role boundaries", () => {
  it("keeps sales away from tenant and security administration", () => {
    expect(
      hasPlatformPermission("platform_sales", "platform.sales.manage"),
    ).toBe(true);
    expect(
      hasPlatformPermission("platform_sales", "platform.tenants.manage"),
    ).toBe(false);
    expect(
      hasPlatformPermission("platform_sales", "platform.security.manage"),
    ).toBe(false);
  });
  it("keeps support away from plans, owner roles and security settings", () => {
    expect(
      hasPlatformPermission("platform_support", "platform.support.diagnose"),
    ).toBe(true);
    expect(
      hasPlatformPermission("platform_support", "platform.tenants.manage"),
    ).toBe(false);
    expect(
      hasPlatformPermission("platform_support", "platform.security.manage"),
    ).toBe(false);
  });
});
