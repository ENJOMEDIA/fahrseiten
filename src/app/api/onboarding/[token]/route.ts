import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthRateLimiter } from "@/modules/auth/rate-limit";
import { isTrustedMutationRequest } from "@/modules/security/origin";
import { SetupInputError } from "@/modules/setup/error";
import { completeTenantOnboarding } from "@/modules/setup/tenant-onboarding";

const limiter = new AuthRateLimiter(8, 30 * 60_000, 30 * 60_000);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const { token } = await params;
  const key = limiter.key("tenant-onboarding", token);
  if (!limiter.isAllowed(key)) return new NextResponse(null, { status: 429 });

  try {
    const result = await completeTenantOnboarding({
      ...(await request.json()),
      token,
    });
    limiter.clear(key);
    return NextResponse.json(result, { status: 201 });
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
              : "Onboarding fehlgeschlagen. Bitte Support kontaktieren.",
      },
      { status: expectedError ? 422 : 500 },
    );
  }
}
