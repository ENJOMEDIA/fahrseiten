import { describe, expect, it } from "vitest";
import { submitSalesLead, type SalesLeadRecord } from "./lead-service";
describe("marketing leads", () => {
  it("routes a valid consultation request to sales", async () => {
    const rows: SalesLeadRecord[] = [];
    const result = await submitSalesLead(
      {
        companyName: "Fahrschule Beispiel",
        contactName: "Alex Demo",
        email: "alex@example.invalid",
        message: "Bitte um eine fiktive Beratung.",
        privacyAccepted: true,
        privacyTextVersion: "marketing-local-v1",
        website: "",
        startedAt: 1_000,
      },
      {
        async create(row) {
          rows.push(row);
        },
      },
      4_000,
    );
    expect(result.status).toBe("new");
    expect(rows[0]).toMatchObject({
      source: "marketing_website",
      status: "new",
    });
  });
  it("rejects honeypot content", async () => {
    await expect(
      submitSalesLead(
        {
          companyName: "Bot Firma",
          contactName: "Bot Name",
          email: "bot@example.invalid",
          message: "Hallo Welt",
          privacyAccepted: true,
          privacyTextVersion: "marketing-local-v1",
          website: "spam",
          startedAt: 1_000,
        },
        { async create() {} },
        4_000,
      ),
    ).rejects.toThrow();
  });
});
