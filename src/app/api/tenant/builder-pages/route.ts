import { NextResponse } from "next/server";
import { z } from "zod";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  BuilderPageConflictError,
  createTenantBuilderPage,
} from "@/modules/builder/tenant-pages";
import { normalizePageSlug } from "@/modules/builder/page-templates";
import { isTenantFeatureEnabled } from "@/modules/features/access";
import { isTrustedMutationRequest } from "@/modules/security/origin";

const requestSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().max(160),
  blocks: z.unknown(),
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
  const [websiteEnabled, builderEnabled] = await Promise.all([
    isTenantFeatureEnabled(membership.tenantId, "managed_website"),
    isTenantFeatureEnabled(membership.tenantId, "website_builder"),
  ]);
  if (!websiteEnabled || !builderEnabled)
    return NextResponse.json(
      {
        created: false,
        message: "Der Website-Builder ist nicht freigeschaltet.",
      },
      { status: 403 },
    );
  try {
    const input = requestSchema.parse(await request.json());
    const slug = normalizePageSlug(input.slug || input.title);
    const page = await createTenantBuilderPage({
      tenantId: membership.tenantId,
      userId: identity.id,
      title: input.title,
      slug,
      blocks: input.blocks,
    });
    return NextResponse.json({ created: true, page });
  } catch (error) {
    const conflict = error instanceof BuilderPageConflictError;
    return NextResponse.json(
      {
        created: false,
        message:
          error instanceof Error
            ? error.message
            : "Die Seite konnte nicht angelegt werden.",
      },
      { status: conflict ? 409 : 422 },
    );
  }
}
