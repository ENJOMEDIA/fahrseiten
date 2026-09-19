import { createHmac } from "node:crypto";

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

    expect(token).toHaveLength(32);
    expect(url.pathname).toBe(`/brief/${leadId}/${token}`);
    expect(url.search).toBe("");
    expect(verifyPostalCampaignToken(leadId, token, secret)).toBe(true);
    expect(verifyPostalCampaignToken(otherLeadId, token, secret)).toBe(false);
  });

  it("keeps existing 64-character campaign links valid", () => {
    const leadId = "8ed5caf5-1e49-42fe-a850-8ecea4dce36f";
    const secret = "test-secret-with-at-least-24-characters";
    const legacyToken = createHmac("sha256", secret)
      .update(`postal-campaign:${leadId}`)
      .digest("hex");

    expect(legacyToken).toHaveLength(64);
    expect(verifyPostalCampaignToken(leadId, legacyToken, secret)).toBe(true);
  });
});
