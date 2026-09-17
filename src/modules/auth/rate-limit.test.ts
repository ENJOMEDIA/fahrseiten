import { describe, expect, it } from "vitest";

import { AuthRateLimiter } from "./rate-limit";

describe("auth rate limiter", () => {
  it("blocks after the configured number of failures", () => {
    const limiter = new AuthRateLimiter(2, 60_000, 60_000);
    const key = limiter.key("login", "USER@example.test");
    limiter.recordFailure(key, 1_000);
    expect(limiter.isAllowed(key, 1_001)).toBe(true);
    limiter.recordFailure(key, 1_002);
    expect(limiter.isAllowed(key, 1_003)).toBe(false);
    expect(limiter.isAllowed(key, 61_003)).toBe(true);
  });
});
