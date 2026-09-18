import { describe, expect, it } from "vitest";
import { consentNoticeVersion, necessaryOnly } from "./model";
import { recordConsentEvidence, type ConsentEvidence } from "./service";

describe("consent evidence", () => {
  it("stores a hash instead of the browser identifier", async () => {
    const rows: ConsentEvidence[] = [];
    const subjectId = "81b3e709-f07e-4f19-a36d-d734f5633104";
    await recordConsentEvidence(
      {
        subjectId,
        noticeVersion: consentNoticeVersion([
          { category: "statistics", label: "Statistik", services: "intern" },
        ]),
        choices: necessaryOnly,
      },
      "fahrseiten.de",
      {
        async create(row) {
          rows.push(row);
        },
      },
      new Date("2026-09-17T10:00:00.000Z"),
    );
    expect(rows[0].subjectHash).toHaveLength(64);
    expect(rows[0].subjectHash).not.toContain(subjectId);
    expect(rows[0].sourceHost).toBe("fahrseiten.de");
  });
});
