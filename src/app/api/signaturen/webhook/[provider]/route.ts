import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import {
  getSignatureProvider,
  SignatureProviderNotConfiguredError,
} from "@/modules/contracts/provider";
import { applyVerifiedSignatureEvent } from "@/modules/contracts/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const provider = getSignatureProvider();
    if (provider.key !== (await params).provider)
      return NextResponse.json(
        { error: "Unbekannter Anbieter." },
        { status: 404 },
      );
    const payload = new Uint8Array(await request.clone().arrayBuffer());
    const event = await provider.verifyWebhook(request);
    await applyVerifiedSignatureEvent(
      provider.key,
      event,
      createHash("sha256").update(payload).digest("hex"),
    );
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof SignatureProviderNotConfiguredError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Signaturereignis konnte nicht verarbeitet werden." },
      { status: 400 },
    );
  }
}
