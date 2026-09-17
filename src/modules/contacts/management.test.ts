import { describe, expect, it, vi } from "vitest";
import {
  changeInquiryStatus,
  type InquiryManagementRepository,
} from "./management";
describe("inquiry management", () => {
  it("scopes status changes to the current tenant", async () => {
    const updateStatus = vi.fn(async () => {});
    const repository: InquiryManagementRepository = {
      async findStatus(tenantId) {
        return tenantId === "tenant-a" ? "new" : null;
      },
      updateStatus,
      async addNote() {},
    };
    await changeInquiryStatus({
      tenantId: "tenant-a",
      inquiryId: "inquiry-1",
      status: "in_progress",
      actorUserId: "user-1",
      repository,
    });
    expect(updateStatus).toHaveBeenCalledWith(
      "tenant-a",
      "inquiry-1",
      "in_progress",
      "user-1",
    );
    await expect(
      changeInquiryStatus({
        tenantId: "tenant-b",
        inquiryId: "inquiry-1",
        status: "spam",
        actorUserId: "user-1",
        repository,
      }),
    ).rejects.toThrow(/nicht gefunden/);
  });
});
