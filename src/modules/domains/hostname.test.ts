import { describe, expect, it } from "vitest";

import {
  InvalidHostnameError,
  normalizeHostname,
  selectRequestHostname,
} from "./hostname";

describe("hostname normalization", () => {
  it("normalizes case, port, trailing dot and IDN", () => {
    expect(normalizeHostname("Demo.FahrSeiten.DE:3000")).toBe(
      "demo.fahrseiten.de",
    );
    expect(normalizeHostname("fahrschule-münchen.de.")).toBe(
      "xn--fahrschule-mnchen-e3b.de",
    );
  });

  it("rejects malformed host values", () => {
    expect(() => normalizeHostname("example.test/path")).toThrow(
      InvalidHostnameError,
    );
    expect(() => normalizeHostname("user@example.test")).toThrow(
      InvalidHostnameError,
    );
  });

  it("ignores forwarded hosts unless explicitly trusted", () => {
    expect(
      selectRequestHostname({
        host: "safe.test",
        forwardedHost: "spoofed.test",
        trustProxyHeaders: false,
      }),
    ).toBe("safe.test");
    expect(
      selectRequestHostname({
        host: "proxy.internal",
        forwardedHost: "public.test",
        trustProxyHeaders: true,
      }),
    ).toBe("public.test");
  });
});
