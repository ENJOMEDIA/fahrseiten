import { NextResponse } from "next/server";
import { z } from "zod";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  publishTenantBuilderDraft,
  saveTenantBuilderDraft,
} from "@/modules/builder/tenant-pages";
import { isTrustedMutationRequest } from "@/modules/security/origin";

const requestSchema = z.object({
  pageId: z.uuid(),
  blocks: z.unknown(),
  publish: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (
    !identity ||
    !membership ||
    !hasTenantPermission(membership.role, "tenant.content.write")
  )
    return new NextResponse(null, { status: 403 });
  try {
    const input = requestSchema.parse(await request.json());
    if (
      input.publish &&
      !hasTenantPermission(membership.role, "tenant.content.publish")
    )
      return new NextResponse(null, { status: 403 });
    const result = input.publish
      ? await publishTenantBuilderDraft({
          tenantId: membership.tenantId,
          userId: identity.id,
          pageId: input.pageId,
          blocks: input.blocks,
        })
      : await saveTenantBuilderDraft({
          tenantId: membership.tenantId,
          userId: identity.id,
          pageId: input.pageId,
          blocks: input.blocks,
        });
    return NextResponse.json({ saved: true, ...result });
  } catch {
    return NextResponse.json(
      {
        saved: false,
        message: "Der Seitenentwurf konnte nicht gespeichert werden.",
      },
      { status: 422 },
    );
  }
}
