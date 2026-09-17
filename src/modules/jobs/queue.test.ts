import { describe, expect, it, vi } from "vitest";
import { enqueueEmailJob } from "./queue";
describe("notification queue", () => {
  it.each([
    "contact_inquiry_received",
    "password_reset",
    "user_invitation",
    "follow_up_due",
  ] as const)("prepares an idempotent %s job", async (template) => {
    const enqueue = vi.fn(async () => true);
    expect(
      await enqueueEmailJob(
        {
          tenantId: "tenant-1",
          idempotencyKey: `${template}:entity-1`,
          to: "team@example.invalid",
          from: "noreply@example.invalid",
          template,
          values: { headline: "Test", reference: "REF-1" },
        },
        { enqueue },
      ),
    ).toBe(true);
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "notification",
        idempotencyKey: `${template}:entity-1`,
        payload: expect.objectContaining({ template }),
      }),
    );
  });
});
