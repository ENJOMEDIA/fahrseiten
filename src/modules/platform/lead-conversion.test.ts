import { describe, expect, it, vi } from "vitest";
import {
  convertWonLead,
  type LeadConversionRepository,
} from "./lead-conversion";
describe("lead conversion", () => {
  it("converts a won lead without duplicating entered company data", async () => {
    const repository: LeadConversionRepository = {
      async findLeadForUpdate() {
        return {
          id: "lead-1",
          companyName: "Fahrschule Morgenrot",
          status: "won",
        };
      },
      async createTenantFromLead(input) {
        expect(input).toEqual({
          name: "Fahrschule Morgenrot",
          slug: "fahrschule-morgenrot",
        });
        return "tenant-1";
      },
      markConverted: vi.fn(async () => {}),
    };
    expect(await convertWonLead("lead-1", repository)).toBe("tenant-1");
    expect(repository.markConverted).toHaveBeenCalledWith("lead-1", "tenant-1");
  });
  it("returns an existing tenant on retries", async () => {
    const createTenantFromLead = vi.fn(async () => "new");
    const repository: LeadConversionRepository = {
      async findLeadForUpdate() {
        return {
          id: "lead-1",
          companyName: "Demo",
          status: "won",
          convertedTenantId: "tenant-existing",
        };
      },
      createTenantFromLead,
      async markConverted() {},
    };
    expect(await convertWonLead("lead-1", repository)).toBe("tenant-existing");
    expect(createTenantFromLead).not.toHaveBeenCalled();
  });
  it("rejects leads outside the won stage", async () => {
    const repository: LeadConversionRepository = {
      async findLeadForUpdate() {
        return { id: "lead-1", companyName: "Demo", status: "offer" };
      },
      async createTenantFromLead() {
        return "x";
      },
      async markConverted() {},
    };
    await expect(convertWonLead("lead-1", repository)).rejects.toThrow(
      /gewonnene/,
    );
  });
});
