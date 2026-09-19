import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  navigationItems,
  pageBlocks,
  pageVersions,
  seoSettings,
  sitePages,
  sites,
  tenants,
  themeSettings,
} from "@/db/schema";

import { parseStoredBlocks } from "./block-schema";
import type { PublishedPage, TenantWebsite } from "./types";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { hydrateTenantContentBlocks } from "@/modules/content/block-data";

export async function findTenantWebsite(
  tenantId: string,
): Promise<TenantWebsite | null> {
  const rows = await db
    .select({ site: sites, tenant: tenants, theme: themeSettings })
    .from(sites)
    .innerJoin(
      tenants,
      and(eq(tenants.id, sites.tenantId), eq(tenants.status, "active")),
    )
    .leftJoin(themeSettings, eq(themeSettings.tenantId, tenantId))
    .where(eq(sites.tenantId, tenantId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const navigation = await db
    .select({ item: navigationItems, pageSlug: sitePages.slug })
    .from(navigationItems)
    .leftJoin(
      sitePages,
      and(
        eq(sitePages.id, navigationItems.pageId),
        eq(sitePages.tenantId, tenantId),
      ),
    )
    .where(
      and(
        eq(navigationItems.tenantId, tenantId),
        eq(navigationItems.siteId, row.site.id),
        eq(navigationItems.visible, true),
      ),
    )
    .orderBy(asc(navigationItems.position));
  return {
    tenantId,
    name: row.tenant.name,
    maintenanceMode: row.site.maintenanceMode,
    maintenanceMessage: row.site.maintenanceMessage,
    navigation: navigation.map(({ item, pageSlug }) => ({
      id: item.id,
      label: item.label,
      href: item.externalUrl ?? `/${pageSlug ?? ""}`,
      position: item.position,
    })),
    theme: {
      themeKey: row.theme?.themeKey ?? "calm_cyan",
      fontKey: row.theme?.fontKey ?? "system_sans",
      primaryColor: row.theme?.primaryColor ?? "#0891b2",
      accentColor: row.theme?.accentColor ?? "#0f172a",
      logoUrl: row.theme?.logoMediaId
        ? mediaPublicUrl(row.theme.logoMediaId)
        : undefined,
    },
  };
}

export async function findPublishedPage(
  tenantId: string,
  slug: string,
): Promise<PublishedPage | null> {
  const rows = await db
    .select({ page: sitePages, version: pageVersions, seo: seoSettings })
    .from(sitePages)
    .innerJoin(
      pageVersions,
      and(
        eq(pageVersions.id, sitePages.publishedVersionId),
        eq(pageVersions.tenantId, tenantId),
      ),
    )
    .leftJoin(
      seoSettings,
      and(
        eq(seoSettings.pageId, sitePages.id),
        eq(seoSettings.tenantId, tenantId),
      ),
    )
    .where(
      and(
        eq(sitePages.tenantId, tenantId),
        eq(sitePages.slug, slug),
        eq(sitePages.status, "published"),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const stored = await db
    .select()
    .from(pageBlocks)
    .where(
      and(
        eq(pageBlocks.tenantId, tenantId),
        eq(pageBlocks.versionId, row.version.id),
      ),
    )
    .orderBy(asc(pageBlocks.position));
  return {
    tenantId,
    slug: row.page.slug,
    title: row.version.title,
    version: row.version.version,
    blocks: await hydrateTenantContentBlocks(
      tenantId,
      parseStoredBlocks(
        stored.map((block) => ({
          id: block.id,
          schemaVersion: block.schemaVersion,
          position: block.position,
          visible: block.visible,
          properties: block.properties,
        })),
      ),
    ),
    seo: {
      title: row.seo?.title ?? undefined,
      description: row.seo?.description ?? undefined,
      canonicalPath: row.seo?.canonicalPath ?? undefined,
      noIndex: row.seo?.noIndex ?? false,
    },
  };
}
