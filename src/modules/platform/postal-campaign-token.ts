import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

function sign(value: string, secret: string) {
  if (secret.length < 24) throw new Error("Das Signatur-Secret ist zu kurz.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createPostalCampaignToken(leadId: string, secret: string) {
  return sign(`postal-campaign:${leadId}`, secret);
}

export function verifyPostalCampaignToken(
  leadId: string,
  token: string,
  secret: string,
) {
  if (!z.uuid().safeParse(leadId).success || !/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }
  const expected = Buffer.from(
    createPostalCampaignToken(leadId, secret),
    "hex",
  );
  const received = Buffer.from(token, "hex");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function createPostalCampaignUrl(
  leadId: string,
  baseUrl: string,
  secret: string,
) {
  const token = createPostalCampaignToken(leadId, secret);
  return new URL(`/brief/${leadId}?token=${token}`, baseUrl).toString();
}
