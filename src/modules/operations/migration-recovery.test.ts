import { describe, expect, it } from "vitest";

import { interruptedMigrationRecoveryDecision } from "./migration-recovery";

describe("interrupted newsletter migration recovery", () => {
  it("resets only empty tables from an unrecorded migration", () => {
    expect(
      interruptedMigrationRecoveryDecision({
        migrationApplied: false,
        existingTables: ["sales_newsletter_campaigns"],
        rowCounts: { sales_newsletter_campaigns: 0 },
      }),
    ).toBe("reset");
  });

  it("blocks recovery when an unrecorded table contains data", () => {
    expect(
      interruptedMigrationRecoveryDecision({
        migrationApplied: false,
        existingTables: ["sales_newsletter_campaigns"],
        rowCounts: { sales_newsletter_campaigns: 1 },
      }),
    ).toBe("blocked");
  });

  it("leaves an applied migration untouched", () => {
    expect(
      interruptedMigrationRecoveryDecision({
        migrationApplied: true,
        existingTables: ["sales_newsletter_campaigns"],
        rowCounts: { sales_newsletter_campaigns: 0 },
      }),
    ).toBe("none");
  });
});
