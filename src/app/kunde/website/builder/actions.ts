"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { db } from "@/db/client";
import { themeSettings } from "@/db/schema";
import { builderThemeValues, builderThemes } from "@/modules/builder/themes";
import { findFeatureSources } from "@/modules/features/repository";
import {
  isFeatureUsable,
  resolveFeatureStatus,
} from "@/modules/features/service";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

export async function saveTenantBuilderTheme(formData: FormData) {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (
    !identity ||
    !membership ||
    !hasTenantPermission(membership.role, "tenant.settings.manage")
  )
    redirect("/login");
  const context = createMembershipTenantContext({
    requestedTenantId: membership.tenantId,
    userId: identity.id,
    activeTenantIds: identity.memberships.map((item) => item.tenantId),
  });
  const sources = await findFeatureSources(context.tenantId, "theme_templates");
  if (!sources || !isFeatureUsable(resolveFeatureStatus(sources)))
    throw new Error("Designvorlagen sind ab dem Paket Wachstum verfügbar.");
  const themeKey = z.enum(builderThemeValues).parse(formData.get("themeKey"));
  const theme = builderThemes[themeKey];
  await db
    .update(themeSettings)
    .set({
      themeKey,
      primaryColor: theme.primary,
      accentColor: theme.accent,
    })
    .where(eq(themeSettings.tenantId, context.tenantId));
  revalidatePath("/kunde/website/builder");
  revalidatePath("/site", "layout");
}
