import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { AuthRateLimiter } from "@/modules/auth/rate-limit";
import { dbSalesLeadRepository } from "@/modules/sales/db-repository";
import { demoSalesLeadRepository } from "@/modules/sales/demo-repository";
import { submitSalesLead } from "@/modules/sales/lead-service";
import { isTrustedMutationRequest } from "@/modules/security/origin";
const limiter = new AuthRateLimiter(5, 15 * 60_000, 15 * 60_000);
export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const fingerprint = createHash("sha256")
    .update(request.headers.get("user-agent") ?? "unknown")
    .digest("hex");
  const key = limiter.key("sales-lead", fingerprint);
  if (!limiter.isAllowed(key))
    return NextResponse.json({ ok: false }, { status: 429 });
  try {
    const repository =
      env.DEMO_DATA_MODE === "fixture" && process.env.NODE_ENV !== "production"
        ? demoSalesLeadRepository
        : dbSalesLeadRepository;
    await submitSalesLead(await request.json(), repository);
    return NextResponse.json({ ok: true });
  } catch {
    limiter.recordFailure(key);
    return NextResponse.json({ ok: false }, { status: 422 });
  }
}
