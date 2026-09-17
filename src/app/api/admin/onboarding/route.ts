import { NextResponse } from "next/server";

import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { isTrustedMutationRequest } from "@/modules/security/origin";
import { createTenantOnboardingLink } from "@/modules/setup/tenant-onboarding";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const publicOrigin = request.headers.get("origin");
  if (!publicOrigin) return new NextResponse(null, { status: 403 });
  const identity = await getSessionIdentity();
  if (
    !identity ||
    !hasPlatformPermission(identity.platformRole, "platform.tenants.manage")
  ) {
    return new NextResponse(null, { status: 403 });
  }

  const token = await createTenantOnboardingLink(identity.id);
  return NextResponse.json(
    {
      url: new URL(`/onboarding/${token}`, publicOrigin).toString(),
      expiresInDays: 7,
    },
    { status: 201 },
  );
}
