import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./env-schema";

describe("parseServerEnv", () => {
  it("uses safe local defaults", () => {
    expect(parseServerEnv({})).toEqual({
      NODE_ENV: "development",
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL:
        "mysql://fahrseiten_local:local_only@127.0.0.1:3306/fahrseiten_local",
      TRUST_PROXY_HEADERS: false,
      MARKETING_HOSTS: "localhost,127.0.0.1,fahrseiten.de,www.fahrseiten.de",
      APP_HOSTS: "app.localhost,app.fahrseiten.de",
      DEMO_HOSTS: "demo.localhost,demo.fahrseiten.de,demo.fahrseiten.local",
      DEMO_DATA_MODE: "fixture",
    });
  });

  it("rejects invalid URLs", () => {
    expect(() => parseServerEnv({ APP_BASE_URL: "not-a-url" })).toThrow();
  });
});
