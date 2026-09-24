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
import Link from "next/link";
import { findWebsiteSetupState } from "@/modules/onboarding/website-setup";

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
    .filter(
      ([key, item]) => item.group === "content" || key === "contact_teaser",
    )
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
  const [assets, featureSources, themes, pages, hydratedContent, setupState] =
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
      findWebsiteSetupState(membership.tenantId),
    ]);
  return (
    <>
      {!setupState.complete ? (
        <section className="mb-5 flex flex-col gap-4 rounded-[1.5rem] border border-cyan-200 bg-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-600 font-semibold text-white"
            >
              {setupState.percent}%
            </span>
            <div>
              <p className="font-semibold text-slate-950">
                Deine Inhalte sind noch nicht vollständig
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Der geführte Assistent füllt Klassen, Fahrzeuge und Kontakt
                vorab. Danach setzt du hier nur noch die passenden Bereiche
                zusammen.
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
            href="/kunde/einrichtung"
          >
            Einrichtung fortsetzen
          </Link>
        </section>
      ) : null}
      <BuilderDemo
        canUseThemes={Boolean(
          featureSources &&
          isFeatureUsable(resolveFeatureStatus(featureSources)),
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
    </>
  );
}
