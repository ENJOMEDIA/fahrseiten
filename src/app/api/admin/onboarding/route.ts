import { NextResponse } from "next/server";
import { z } from "zod";

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

  const input = z
    .object({
      companyName: z.string().trim().max(160).default(""),
      ownerName: z.string().trim().max(160).default(""),
      ownerEmail: z.union([z.literal(""), z.email()]).default(""),
      phone: z.string().trim().max(40).default(""),
      domain: z.string().trim().max(253).default(""),
      sendInvitation: z.boolean().default(false),
    })
    .parse(await request.json().catch(() => ({})));
  if (input.sendInvitation && !input.ownerEmail)
    return NextResponse.json(
      {
        message: "Für den E-Mail-Versand wird eine Empfängeradresse benötigt.",
      },
      { status: 422 },
    );
  const result = await createTenantOnboardingLink({
    createdByUserId: identity.id,
    publicOrigin,
    sendInvitation: input.sendInvitation,
    prefill: Object.fromEntries(
      Object.entries(input).filter(
        ([key, value]) => key !== "sendInvitation" && value !== "",
      ),
    ),
  });
  return NextResponse.json(
    {
      url: result.actionUrl,
      expiresInDays: 7,
      invitationQueued: input.sendInvitation,
    },
    { status: 201 },
  );
}
