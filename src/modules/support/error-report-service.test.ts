import { describe, expect, it } from "vitest";
import {
  submitErrorReport,
  type ErrorReportRecord,
} from "./error-report-service";

describe("error reports", () => {
  it("creates a traceable report without requiring personal data", async () => {
    const records: ErrorReportRecord[] = [];
    const result = await submitErrorReport(
      {
        summary: "Vorschau bleibt leer",
        description: "Nach dem Speichern bleibt die lokale Vorschau leer.",
        surface: "customer_backend",
        website: "",
      },
      {
        async create(record) {
          records.push(record);
        },
      },
    );
    expect(result.referenceId).toMatch(/^FS-/);
    expect(records[0].status).toBe("new");
  });
});
