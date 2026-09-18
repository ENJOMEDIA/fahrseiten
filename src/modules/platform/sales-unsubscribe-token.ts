import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

function signature(leadId: string, secret: string) {
  if (secret.length < 24) {
    throw new Error("Das Secret für sichere Abmeldelinks ist zu kurz.");
  }

  return createHmac("sha256", secret)
    .update(`sales-unsubscribe:${leadId}`)
    .digest("hex");
}

export function createSalesUnsubscribeUrl(
  leadId: string,
  baseUrl: string,
  secret: string,
) {
  const query = new URLSearchParams({
    lead: leadId,
    token: signature(leadId, secret),
  });
  return new URL(`/akquise/abmelden?${query}`, baseUrl).toString();
}

export function verifySalesUnsubscribeTokenValue(
  leadId: string,
  token: string,
  secret: string,
) {
  if (!z.uuid().safeParse(leadId).success || !/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }

  const expected = Buffer.from(signature(leadId, secret), "hex");
  const received = Buffer.from(token, "hex");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
