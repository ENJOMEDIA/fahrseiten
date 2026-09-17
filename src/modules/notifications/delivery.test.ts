import { describe, expect, it, vi } from "vitest";
import type { JobRecord } from "@/modules/jobs/runner";
import { deliverEmailJob, type DeliveryRepository } from "./delivery";
import { CatchMailTransport } from "./mail-transport";
describe("notification delivery", () => {
  it("does not deliver an idempotency key twice", async () => {
    const keys = new Set<string>();
    const repository: DeliveryRepository = {
      async reserve(input) {
        if (keys.has(input.idempotencyKey)) return false;
        keys.add(input.idempotencyKey);
        return true;
      },
      markSent: vi.fn(async () => {}),
      markFailed: vi.fn(async () => {}),
    };
    const transport = new CatchMailTransport();
    const job: JobRecord = {
      id: "job-1",
      tenantId: "tenant-1",
      type: "notification",
      idempotencyKey: "contact:1",
      attempts: 0,
      maxAttempts: 4,
      payload: {
        to: "team@example.invalid",
        from: "noreply@example.invalid",
        template: "contact_inquiry_received",
        values: { headline: "Neue Demo-Anfrage", reference: "FS-DEMO-1" },
      },
    };
    await deliverEmailJob(job, repository, transport);
    await deliverEmailJob(job, repository, transport);
    expect(transport.messages).toHaveLength(1);
    expect(transport.messages[0]).toMatchObject({
      subject: "Neue Anfrage · FS-DEMO-1",
    });
  });
});
