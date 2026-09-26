import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  interruptedMigrationRecoveryDecision,
  isNewsletterMigrationConflict,
} from "./migration-recovery";

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

  it("erkennt den von Drizzle verpackten Newsletter-Tabellenkonflikt", () => {
    expect(
      isNewsletterMigrationConflict(
        new Error(
          "Failed query: CREATE TABLE `sales_newsletter_campaigns` (...) ",
        ),
      ),
    ).toBe(true);
    expect(
      isNewsletterMigrationConflict(new Error("Verbindung fehlgeschlagen")),
    ).toBe(false);
  });

  it("verwendet MariaDB-kompatible Bezeichner in der Newsletter-Migration", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "drizzle/0039_amused_madrox.sql"),
      "utf8",
    );
    const identifiers = [
      ...sql.matchAll(/(?:CONSTRAINT|INDEX) `([^`]+)`/g),
    ].map((match) => match[1]);
    expect(identifiers.length).toBeGreaterThan(0);
    expect(identifiers.filter((name) => name.length > 64)).toEqual([]);
  });
});
