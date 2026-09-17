import { describe, expect, it } from "vitest";

import {
  createDomainVerificationToken,
  hashDomainVerificationToken,
} from "./verification";

describe("domain verification token", () => {
  it("stores only a deterministic hash", () => {
    const result = createDomainVerificationToken();
    expect(result.token).toMatch(/^fahrseiten-/);
    expect(result.hash).toHaveLength(64);
    expect(hashDomainVerificationToken(result.token)).toBe(result.hash);
    expect(result.hash).not.toContain(result.token);
  });
});
