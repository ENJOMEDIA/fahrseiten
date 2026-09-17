import { describe, expect, it, vi } from "vitest";
import { openSupportView } from "./support";
describe("support view", () => {
  it("records a reason and never impersonates a customer", async () => {
    const record = vi.fn(async () => {});
    const result = await openSupportView({
      actorUserId: "support-1",
      tenantId: "tenant-1",
      reason: "Fehlerreferenz prüfen",
      repository: { record },
    });
    expect(result).toEqual({
      tenantId: "tenant-1",
      mode: "read_only",
      impersonated: false,
    });
    expect(record).toHaveBeenCalledOnce();
  });
  it("rejects unexplained access", async () => {
    await expect(
      openSupportView({
        actorUserId: "support-1",
        tenantId: "tenant-1",
        reason: "kurz",
        repository: { async record() {} },
      }),
    ).rejects.toThrow();
  });
});
