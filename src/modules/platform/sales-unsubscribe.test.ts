import { describe, expect, it } from "vitest";

import {
  createSalesUnsubscribeUrl,
  verifySalesUnsubscribeTokenValue,
} from "./sales-unsubscribe-token";

describe("sales unsubscribe links", () => {
  it("accepts only the signed lead id", () => {
    const leadId = "8ed5caf5-1e49-42fe-a850-8ecea4dce36f";
    const secret = "test-secret-with-at-least-24-characters";
    const url = new URL(
      createSalesUnsubscribeUrl(leadId, "https://fahrseiten.de", secret),
    );
    const token = url.searchParams.get("token") ?? "";
    const tamperedToken = `${token[0] === "0" ? "1" : "0"}${token.slice(1)}`;

    expect(url.pathname).toBe("/akquise/abmelden");
    expect(verifySalesUnsubscribeTokenValue(leadId, token, secret)).toBe(true);
    expect(
      verifySalesUnsubscribeTokenValue(
        "94ed0bf6-c8b1-476b-bd58-76a76f183a21",
        token,
        secret,
      ),
    ).toBe(false);
    expect(
      verifySalesUnsubscribeTokenValue(leadId, tamperedToken, secret),
    ).toBe(false);
  });
});
