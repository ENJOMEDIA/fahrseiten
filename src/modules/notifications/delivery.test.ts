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

  it("delivers a pre-rendered sales email through the same queue", async () => {
    const repository: DeliveryRepository = {
      reserve: vi.fn(async () => true),
      markSent: vi.fn(async () => {}),
      markFailed: vi.fn(async () => {}),
    };
    const transport = new CatchMailTransport();
    await deliverEmailJob(
      {
        id: "job-sales",
        tenantId: null,
        type: "notification",
        idempotencyKey: "sales:one",
        attempts: 0,
        maxAttempts: 4,
        payload: {
          to: "school@example.invalid",
          from: "sales@example.invalid",
          template: "sales_outreach",
          values: {
            subject: "Ihre FahrSeiten-Demo",
            text: "Persönliche Demo-Einladung",
            html: "<p>Persönliche Demo-Einladung</p>",
          },
        },
      },
      repository,
      transport,
    );
    expect(transport.messages[0]).toMatchObject({
      to: "school@example.invalid",
      subject: "Ihre FahrSeiten-Demo",
    });
  });
});
