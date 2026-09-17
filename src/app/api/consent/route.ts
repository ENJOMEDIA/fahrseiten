import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { AuthRateLimiter } from "@/modules/auth/rate-limit";
import {
  dbConsentRepository,
  demoConsentRepository,
} from "@/modules/consent/repositories";
import { recordConsentEvidence } from "@/modules/consent/service";
import { isTrustedMutationRequest } from "@/modules/security/origin";

const limiter = new AuthRateLimiter(20, 15 * 60_000, 15 * 60_000);

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const key = limiter.key(
    "consent",
    request.headers.get("user-agent") ?? "unknown",
  );
  if (!limiter.isAllowed(key)) return new NextResponse(null, { status: 429 });
  try {
    const repository =
      env.DEMO_DATA_MODE === "fixture" && process.env.NODE_ENV !== "production"
        ? demoConsentRepository
        : dbConsentRepository;
    const host =
      request.headers.get("host")?.split(":")[0] ?? "unknown.invalid";
    await recordConsentEvidence(await request.json(), host, repository);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    limiter.recordFailure(key);
    return NextResponse.json({ ok: false }, { status: 422 });
  }
}
