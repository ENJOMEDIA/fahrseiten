import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./env-schema";

describe("parseServerEnv", () => {
  it("uses safe local defaults", () => {
    expect(parseServerEnv({})).toEqual({
      NODE_ENV: "development",
      APP_BASE_URL: "http://localhost:3000",
    });
  });

  it("rejects invalid URLs", () => {
    expect(() => parseServerEnv({ APP_BASE_URL: "not-a-url" })).toThrow();
  });
});
