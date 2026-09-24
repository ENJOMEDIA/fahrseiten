import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { env } from "@/config/env";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { isTrustedMutationRequest } from "@/modules/security/origin";
import {
  createTenantOnboardingLink,
  findInstanceInvitationStatus,
} from "@/modules/setup/tenant-onboarding";
import { runNotificationScheduler } from "@/modules/notifications/runtime";
import { SetupInputError } from "@/modules/setup/error";
import { TENANT_ONBOARDING_VALIDITY_DAYS } from "@/modules/setup/onboarding-policy";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  if (!request.headers.get("origin"))
    return new NextResponse(null, { status: 403 });
  const identity = await getSessionIdentity();
  if (
    !identity ||
    !hasPlatformPermission(identity.platformRole, "platform.tenants.manage")
  ) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const input = z
      .object({
        companyName: z.string().trim().min(2).max(160),
        ownerName: z.string().trim().max(160).default(""),
        ownerEmail: z.union([z.literal(""), z.email()]).default(""),
        phone: z.string().trim().max(40).default(""),
        domain: z.string().trim().max(253).default(""),
        leadId: z.union([z.literal(""), z.uuid()]).default(""),
        planId: z.uuid(),
        billingIntervalMonths: z.union([z.literal(1), z.literal(12)]),
        sendInvitation: z.boolean().default(false),
      })
      .parse(await request.json().catch(() => ({})));
    if (input.sendInvitation && !input.ownerEmail)
      return NextResponse.json(
        {
          message:
            "Für den E-Mail-Versand wird eine Empfängeradresse benötigt.",
        },
        { status: 422 },
      );
    const result = await createTenantOnboardingLink({
      createdByUserId: identity.id,
      leadId: input.leadId || undefined,
      publicOrigin: env.APP_BASE_URL,
      sendInvitation: input.sendInvitation,
      prefill: Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) =>
            !["sendInvitation", "leadId"].includes(key) && value !== "",
        ),
      ),
    });
    if (input.sendInvitation)
      await runNotificationScheduler().catch(() => null);
    const invitation = input.sendInvitation
      ? await findInstanceInvitationStatus(result.tokenId)
      : null;
    return NextResponse.json(
      {
        url: result.actionUrl,
        expiresInDays: TENANT_ONBOARDING_VALIDITY_DAYS,
        invitationQueued: input.sendInvitation,
        invitationProcessed: invitation?.status === "completed",
      },
      { status: 201 },
    );
  } catch (error) {
    const expected =
      error instanceof ZodError || error instanceof SetupInputError;
    return NextResponse.json(
      {
        message:
          error instanceof ZodError
            ? (error.issues[0]?.message ?? "Bitte die Eingaben prüfen.")
            : error instanceof SetupInputError
              ? error.message
              : "Die Instanz konnte nicht vorbereitet werden.",
      },
      { status: expected ? 422 : 500 },
    );
  }
}
