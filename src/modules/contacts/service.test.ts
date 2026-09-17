import { describe, expect, it, vi } from "vitest";
import {
  submitInquiry,
  type InquiryRecord,
  type InquiryRepository,
} from "./service";

function harness() {
  const rows: InquiryRecord[] = [];
  const queued = new Set<string>();
  const repository: InquiryRepository = {
    async create(row) {
      rows.push(row);
    },
    async markNotificationQueued(tenantId, id) {
      const key = `${tenantId}:${id}`;
      if (queued.has(key)) return false;
      queued.add(key);
      return true;
    },
  };
  const enqueue = vi.fn(async () => {});
  return {
    rows,
    repository,
    notifications: { enqueue },
    enqueue,
    rateLimiter: {
      async allow() {
        return true;
      },
    },
  };
}
const valid = {
  formId: "form-1",
  contactName: "Alex Beispiel",
  email: "alex@example.invalid",
  message: "Bitte um fiktive Informationen.",
  privacyTextVersion: "demo-v1",
  consent: true,
  website: "",
  startedAt: 10_000,
  source: "demo",
};
describe("contact inquiries", () => {
  it("stores the correct tenant and enqueues exactly one notification", async () => {
    const h = harness();
    const result = await submitInquiry({
      tenantId: "tenant-a",
      rawInput: valid,
      fingerprint: "hash",
      now: 13_000,
      ...h,
    });
    expect(h.rows[0].tenantId).toBe("tenant-a");
    expect(h.enqueue).toHaveBeenCalledOnce();
    expect(h.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `contact:${result.id}`,
        tenantId: "tenant-a",
      }),
    );
  });
  it("rejects honeypots and submissions that are too fast", async () => {
    const h = harness();
    await expect(
      submitInquiry({
        tenantId: "tenant-a",
        rawInput: { ...valid, website: "bot" },
        fingerprint: "hash",
        now: 13_000,
        ...h,
      }),
    ).rejects.toThrow();
    await expect(
      submitInquiry({
        tenantId: "tenant-a",
        rawInput: { ...valid, startedAt: 12_500 },
        fingerprint: "hash",
        now: 13_000,
        ...h,
      }),
    ).rejects.toThrow(/nicht geprüft/);
    expect(h.rows).toHaveLength(0);
  });
  it("does not leak one tenant through another tenant repository key", async () => {
    const h = harness();
    await submitInquiry({
      tenantId: "tenant-a",
      rawInput: valid,
      fingerprint: "hash",
      now: 13_000,
      ...h,
    });
    expect(h.rows.filter((row) => row.tenantId === "tenant-b")).toHaveLength(0);
  });
});
