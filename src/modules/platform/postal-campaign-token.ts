import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

function sign(value: string, secret: string) {
  if (secret.length < 24) throw new Error("Das Signatur-Secret ist zu kurz.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createPostalCampaignToken(leadId: string, secret: string) {
  return sign(`postal-campaign:${leadId}`, secret).slice(0, 32);
}

export function verifyPostalCampaignToken(
  leadId: string,
  token: string,
  secret: string,
) {
  if (
    !z.uuid().safeParse(leadId).success ||
    !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.test(token)
  ) {
    return false;
  }
  const expectedFull = sign(`postal-campaign:${leadId}`, secret);
  const expected = Buffer.from(expectedFull.slice(0, token.length), "hex");
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
  return new URL(`/brief/${leadId}/${token}`, baseUrl).toString();
}
