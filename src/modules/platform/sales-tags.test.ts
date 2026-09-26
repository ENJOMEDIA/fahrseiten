import { describe, expect, it } from "vitest";
import { parseSalesLeadTags, serializeSalesLeadTags } from "./sales-tags";

describe("Akquise-Tags", () => {
  it("normalisiert, dedupliziert und serialisiert Tags", () => {
    const tags = parseSalesLeadTags(
      "rechtlich veraltet | Aktuelle Wartungen, Rechtlich veraltet",
    );
    expect(tags).toEqual(["Rechtlich veraltet", "Aktuelle Wartungen"]);
    expect(serializeSalesLeadTags(tags)).toBe(
      '["Rechtlich veraltet","Aktuelle Wartungen"]',
    );
  });

  it("liest gespeicherte JSON-Tags", () => {
    expect(parseSalesLeadTags('["Rechtlich veraltet"]')).toEqual([
      "Rechtlich veraltet",
    ]);
  });
});
