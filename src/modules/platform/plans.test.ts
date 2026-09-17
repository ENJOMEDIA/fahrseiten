import { describe, expect, it } from "vitest";

import { priceToCents } from "./pricing";

describe("priceToCents", () => {
  it("accepts German and international decimal separators", () => {
    expect(priceToCents("49,90")).toBe(4990);
    expect(priceToCents("129.00")).toBe(12900);
    expect(priceToCents("")).toBeNull();
  });

  it("rejects ambiguous or negative prices", () => {
    expect(() => priceToCents("1.299,00")).toThrow();
    expect(() => priceToCents("-10")).toThrow();
  });
});
