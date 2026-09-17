import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  demoInquiryRateLimiter,
  demoInquiryRepository,
  demoNotificationPort,
} from "@/modules/contacts/demo-adapters";
import { submitInquiry } from "@/modules/contacts/service";
import { isTrustedMutationRequest } from "@/modules/security/origin";

const DEMO_TENANT_ID = "10000000-0000-4000-8000-000000000001";
export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  if (process.env.NODE_ENV === "production")
    return new NextResponse(null, { status: 404 });
  try {
    const fingerprint = createHash("sha256")
      .update(request.headers.get("user-agent") ?? "unknown")
      .digest("hex");
    await submitInquiry({
      tenantId: DEMO_TENANT_ID,
      rawInput: await request.json(),
      fingerprint,
      repository: demoInquiryRepository,
      notifications: demoNotificationPort,
      rateLimiter: demoInquiryRateLimiter,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Die Anfrage konnte nicht gesendet werden. Bitte prüfe deine Angaben.",
      },
      { status: 422 },
    );
  }
}
