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
import { listTenantBuilderPages } from "@/modules/builder/tenant-pages";
import { isTenantFeatureEnabled } from "@/modules/features/access";
import { redirect } from "next/navigation";
import {
  builderBlockCatalog,
  createBuilderBlockProperties,
  type BuilderBlockType,
} from "@/modules/builder/block-catalog";
import { hydrateTenantContentBlocks } from "@/modules/content/block-data";
import type { StoredBlock } from "@/modules/cms/block-schema";

export default async function CustomerWebsiteBuilderPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  const [websiteEnabled, builderEnabled] = await Promise.all([
    isTenantFeatureEnabled(membership.tenantId, "managed_website"),
    isTenantFeatureEnabled(membership.tenantId, "website_builder"),
  ]);
  if (!websiteEnabled || !builderEnabled)
    redirect("/kunde/funktionen?feature=website_builder");
  const contentTypes = (
    Object.entries(builderBlockCatalog) as [
      BuilderBlockType,
      (typeof builderBlockCatalog)[BuilderBlockType],
    ][]
  )
    .filter(([, item]) => item.group === "content")
    .map(([key]) => key);
  const contentTemplates: StoredBlock[] = contentTypes.map(
    (type, position) => ({
      id: `content-preview-${type}`,
      schemaVersion: 1,
      position,
      visible: true,
      properties: createBuilderBlockProperties(type),
    }),
  );
  const [assets, featureSources, themes, pages, hydratedContent] =
    await Promise.all([
      listTenantMedia(membership.tenantId),
      findFeatureSources(membership.tenantId, "theme_templates"),
      db
        .select({
          themeKey: themeSettings.themeKey,
          fontKey: themeSettings.fontKey,
        })
        .from(themeSettings)
        .where(eq(themeSettings.tenantId, membership.tenantId))
        .limit(1),
      listTenantBuilderPages(membership.tenantId),
      hydrateTenantContentBlocks(membership.tenantId, contentTemplates),
    ]);
  return (
    <BuilderDemo
      canUseThemes={Boolean(
        featureSources && isFeatureUsable(resolveFeatureStatus(featureSources)),
      )}
      initialTheme={themes[0]?.themeKey}
      initialFont={themes[0]?.fontKey}
      initialPages={pages}
      contentPresets={Object.fromEntries(
        hydratedContent.map((block) => [
          block.properties.type,
          block.properties,
        ]),
      )}
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
