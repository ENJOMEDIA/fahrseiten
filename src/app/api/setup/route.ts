import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthRateLimiter } from "@/modules/auth/rate-limit";
import { isTrustedMutationRequest } from "@/modules/security/origin";
import { SetupInputError } from "@/modules/setup/error";
import { completePlatformSetup } from "@/modules/setup/platform-setup";

const limiter = new AuthRateLimiter(5, 15 * 60_000, 30 * 60_000);

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const key = limiter.key(
    "platform-setup",
    request.headers.get("user-agent") ?? "unknown",
  );
  if (!limiter.isAllowed(key)) return new NextResponse(null, { status: 429 });

  try {
    const result = await completePlatformSetup(await request.json());
    limiter.clear(key);
    return NextResponse.json(result);
  } catch (error) {
    limiter.recordFailure(key);
    const expectedError =
      error instanceof SetupInputError || error instanceof ZodError;
    return NextResponse.json(
      {
        message:
          error instanceof SetupInputError
            ? error.message
            : error instanceof ZodError
              ? error.issues[0]?.message
              : "Installation fehlgeschlagen. Bitte Serverprotokoll prüfen.",
      },
      { status: expectedError ? 422 : 500 },
    );
  }
}
