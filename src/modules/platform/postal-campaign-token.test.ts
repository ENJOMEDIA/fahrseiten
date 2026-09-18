import { describe, expect, it } from "vitest";

import {
  createPostalCampaignToken,
  createPostalCampaignUrl,
  verifyPostalCampaignToken,
} from "./postal-campaign-token";

describe("postal campaign links", () => {
  it("binds the signed URL to exactly one lead", () => {
    const leadId = "8ed5caf5-1e49-42fe-a850-8ecea4dce36f";
    const otherLeadId = "94ed0bf6-c8b1-476b-bd58-76a76f183a21";
    const secret = "test-secret-with-at-least-24-characters";
    const token = createPostalCampaignToken(leadId, secret);
    const url = new URL(
      createPostalCampaignUrl(leadId, "https://fahrseiten.de", secret),
    );

    expect(url.pathname).toBe(`/brief/${leadId}`);
    expect(url.searchParams.get("token")).toBe(token);
    expect(verifyPostalCampaignToken(leadId, token, secret)).toBe(true);
    expect(verifyPostalCampaignToken(otherLeadId, token, secret)).toBe(false);
  });
});
