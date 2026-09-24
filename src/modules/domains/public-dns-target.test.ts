import { describe, expect, it } from "vitest";

import {
  DEFAULT_PUBLIC_DNS_TARGET_HOST,
  isPublicDnsAddress,
  isPublicDnsTargetHostname,
} from "./public-dns-target";

describe("public DNS target", () => {
  it("uses the public FahrSeiten host independently from local app URLs", () => {
    expect(DEFAULT_PUBLIC_DNS_TARGET_HOST).toBe("fahrseiten.de");
    expect(isPublicDnsTargetHostname("fahrseiten.de")).toBe(true);
    expect(isPublicDnsTargetHostname("www.fahrseiten.de.")).toBe(true);
  });

  it.each([
    "localhost",
    "app.localhost",
    "fahrseiten.local",
    "fahrseiten.test",
    "127.0.0.1",
  ])("rejects local target %s", (hostname) => {
    expect(isPublicDnsTargetHostname(hostname)).toBe(false);
  });

  it.each(["127.0.0.1", "10.0.0.5", "192.168.1.20", "::1", "fd00::1"])(
    "rejects private target address %s",
    (address) => {
      expect(isPublicDnsAddress(address)).toBe(false);
    },
  );

  it.each(["185.243.135.64", "2a03:4000:6:1234::1"])(
    "accepts public target address %s",
    (address) => {
      expect(isPublicDnsAddress(address)).toBe(true);
    },
  );
});
