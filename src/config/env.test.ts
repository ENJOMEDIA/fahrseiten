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
      SMTP_MODE: "catch",
      SMTP_HOST: "localhost",
      SMTP_PORT: 1025,
      SMTP_SECURE: false,
      SMTP_FROM: "FahrSeiten Lokal <noreply@fahrseiten.local>",
      CONSENT_FUNCTIONAL_SERVICES: "",
      CONSENT_STATISTICS_SERVICES: "",
      CONSENT_MARKETING_SERVICES: "",
    });
  });

  it("rejects invalid URLs", () => {
    expect(() => parseServerEnv({ APP_BASE_URL: "not-a-url" })).toThrow();
    expect(() => parseServerEnv({ DASHBOARD_BASE_URL: "not-a-url" })).toThrow();
  });

  it("accepts an optional dashboard host or an empty Plesk value", () => {
    expect(parseServerEnv({ DASHBOARD_BASE_URL: "" }).DASHBOARD_BASE_URL).toBe(
      undefined,
    );
    expect(
      parseServerEnv({ DASHBOARD_BASE_URL: "https://app.fahrseiten.de" })
        .DASHBOARD_BASE_URL,
    ).toBe("https://app.fahrseiten.de");
  });
});
