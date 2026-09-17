import { describe, expect, it } from "vitest";

import {
  createMembershipTenantContext,
  TenantAccessDeniedError,
} from "./tenant-context";
import { InMemoryTenantRepository } from "./tenant-repository";

describe("tenant repository boundary", () => {
  const context = createMembershipTenantContext({
    requestedTenantId: "tenant-a",
    userId: "user-1",
    activeTenantIds: ["tenant-a"],
  });

  const repository = new InMemoryTenantRepository([
    { id: "record-a", tenantId: "tenant-a", title: "A" },
    { id: "record-b", tenantId: "tenant-b", title: "B" },
  ]);

  it("filters list and direct reads to the context", async () => {
    await expect(repository.list(context)).resolves.toEqual([
      { id: "record-a", tenantId: "tenant-a", title: "A" },
    ]);
    await expect(repository.get(context, "record-b")).resolves.toBeNull();
  });

  it("rejects cross-tenant writes", async () => {
    await expect(
      repository.save(context, {
        id: "record-c",
        tenantId: "tenant-b",
        title: "C",
      }),
    ).rejects.toBeInstanceOf(TenantAccessDeniedError);
  });
});
