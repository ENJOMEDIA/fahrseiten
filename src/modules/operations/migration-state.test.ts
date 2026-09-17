import { describe, expect, it } from "vitest";

import { compareMigrationState } from "./migration-state";

const migrations = [
  { folderMillis: 100, hash: "a", sql: [], bps: true },
  { folderMillis: 200, hash: "b", sql: [], bps: true },
  { folderMillis: 300, hash: "c", sql: [], bps: true },
];

describe("migration state", () => {
  it("reports pending migrations instead of reusing a stale ready state", () => {
    expect(
      compareMigrationState(migrations, { createdAt: 200, hash: "b" }),
    ).toMatchObject({
      status: "pending",
      detail: expect.stringContaining("1"),
    });
  });

  it("only reports ready for the current migration and matching hash", () => {
    expect(
      compareMigrationState(migrations, { createdAt: 300, hash: "c" }),
    ).toMatchObject({ status: "ready" });
    expect(
      compareMigrationState(migrations, { createdAt: 300, hash: "falsch" }),
    ).toMatchObject({ status: "error" });
  });
});
