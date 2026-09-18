import { BuilderDemo } from "@/modules/builder/builder-demo";
import { getSessionIdentity } from "@/modules/auth/session";
import { db } from "@/db/client";
import { themeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { findFeatureSources } from "@/modules/features/repository";
import {
  isFeatureUsable,
  resolveFeatureStatus,
} from "@/modules/features/service";
import { listTenantMedia } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";

export default async function CustomerWebsiteBuilderPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) return <BuilderDemo />;
  const [assets, featureSources, themes] = await Promise.all([
    listTenantMedia(membership.tenantId),
    findFeatureSources(membership.tenantId, "theme_templates"),
    db
      .select({ themeKey: themeSettings.themeKey })
      .from(themeSettings)
      .where(eq(themeSettings.tenantId, membership.tenantId))
      .limit(1),
  ]);
  return (
    <BuilderDemo
      canUseThemes={Boolean(
        featureSources && isFeatureUsable(resolveFeatureStatus(featureSources)),
      )}
      initialTheme={themes[0]?.themeKey}
      media={assets.map((asset) => ({
        id: asset.id,
        url: mediaPublicUrl(asset.id),
        label: asset.altText || asset.originalName,
        category: asset.category,
      }))}
      tenantMode
    />
  );
}
