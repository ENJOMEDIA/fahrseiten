import { describe, expect, it } from "vitest";

import { customerNumberFromTenantId } from "./customer-reference";

describe("customer reference", () => {
  it("derives a stable human-readable number from the tenant id", () => {
    const tenantId = "8ed5caf5-1e49-42fe-a850-8ecea4dce36f";

    expect(customerNumberFromTenantId(tenantId)).toBe("FS-8ED5CAF51E49");
    expect(customerNumberFromTenantId(tenantId)).toBe(
      customerNumberFromTenantId(tenantId),
    );
  });

  it("rejects non-UUID identifiers", () => {
    expect(() => customerNumberFromTenantId("tenant-1")).toThrow(/Tenant-ID/);
  });
});
