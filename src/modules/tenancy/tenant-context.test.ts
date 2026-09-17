import { describe, expect, it } from "vitest";

import {
  assertTenantRecord,
  createMembershipTenantContext,
  TenantAccessDeniedError,
} from "./tenant-context";

describe("tenant context", () => {
  const context = createMembershipTenantContext({
    requestedTenantId: "tenant-a",
    userId: "user-1",
    activeTenantIds: ["tenant-a"],
  });

  it("accepts only an active membership", () => {
    expect(context.tenantId).toBe("tenant-a");
    expect(() =>
      createMembershipTenantContext({
        requestedTenantId: "tenant-b",
        userId: "user-1",
        activeTenantIds: ["tenant-a"],
      }),
    ).toThrow(TenantAccessDeniedError);
  });

  it("rejects records from another tenant", () => {
    expect(() => assertTenantRecord(context, "tenant-b")).toThrow(
      TenantAccessDeniedError,
    );
    expect(() => assertTenantRecord(context, "tenant-a")).not.toThrow();
  });
});
