import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, max } from "drizzle-orm";

import { db } from "@/db/client";
import {
  navigationItems,
  pageBlocks,
  pageVersions,
  sitePages,
  sites,
} from "@/db/schema";
import {
  parseStoredBlocks,
  type StoredBlock,
} from "@/modules/cms/block-schema";
import { hydrateTenantContentBlocks } from "@/modules/content/block-data";

export type TenantBuilderPage = {
  id: string;
  title: string;
  slug: string;
  blocks: StoredBlock[];
};

export class BuilderPageConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderPageConflictError";
  }
}

export async function listTenantBuilderPages(
  tenantId: string,
): Promise<TenantBuilderPage[]> {
  const [pages, versions] = await Promise.all([
    db
      .select()
      .from(sitePages)
      .where(eq(sitePages.tenantId, tenantId))
      .orderBy(asc(sitePages.createdAt)),
    db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.tenantId, tenantId))
      .orderBy(desc(pageVersions.version)),
  ]);
  const selected = pages.flatMap((page) => {
    const candidates = versions.filter((version) => version.pageId === page.id);
    const version =
      candidates.find((item) => item.state === "draft") ??
      candidates.find((item) => item.id === page.publishedVersionId) ??
      candidates[0];
    return version ? [{ page, version }] : [];
  });
  const versionIds = selected.map(({ version }) => version.id);
  const blocks = versionIds.length
    ? await db
        .select()
        .from(pageBlocks)
        .where(
          and(
            eq(pageBlocks.tenantId, tenantId),
            inArray(pageBlocks.versionId, versionIds),
          ),
        )
        .orderBy(asc(pageBlocks.position))
    : [];
  return Promise.all(
    selected.map(async ({ page, version }) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      blocks: await hydrateTenantContentBlocks(
        tenantId,
        parseStoredBlocks(
          blocks
            .filter((block) => block.versionId === version.id)
            .map((block) => ({
              id: block.id,
              schemaVersion: block.schemaVersion,
              position: block.position,
              visible: block.visible,
              properties: block.properties,
            })),
        ),
      ),
    })),
  );
}

export async function createTenantBuilderPage(input: {
  tenantId: string;
  userId: string;
  title: string;
  slug: string;
  blocks: unknown;
}): Promise<TenantBuilderPage> {
  const blocks = parseStoredBlocks(input.blocks);
  if (!input.slug)
    throw new BuilderPageConflictError(
      "Für eine zusätzliche Seite ist eine URL erforderlich.",
    );
  return db.transaction(async (tx) => {
    const [site] = await tx
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.tenantId, input.tenantId))
      .limit(1)
      .for("update");
    if (!site)
      throw new Error("Für den Mandanten wurde keine Website gefunden.");
    const [duplicate] = await tx
      .select({ id: sitePages.id })
      .from(sitePages)
      .where(
        and(
          eq(sitePages.tenantId, input.tenantId),
          eq(sitePages.slug, input.slug),
        ),
      )
      .limit(1);
    if (duplicate)
      throw new BuilderPageConflictError(
        "Diese URL wird bereits von einer anderen Seite verwendet.",
      );

    const pageId = randomUUID();
    const versionId = randomUUID();
    await tx.insert(sitePages).values({
      id: pageId,
      tenantId: input.tenantId,
      siteId: site.id,
      slug: input.slug,
      title: input.title,
      status: "draft",
    });
    await tx.insert(pageVersions).values({
      id: versionId,
      tenantId: input.tenantId,
      pageId,
      version: 1,
      state: "draft",
      title: input.title,
      createdByUserId: input.userId,
    });
    const storedBlocks = blocks.map((block) => ({
      ...block,
      id: randomUUID(),
    }));
    if (storedBlocks.length)
      await tx.insert(pageBlocks).values(
        storedBlocks.map((block) => ({
          id: block.id,
          tenantId: input.tenantId,
          versionId,
          blockType: block.properties.type,
          schemaVersion: block.schemaVersion,
          position: block.position,
          visible: block.visible,
          properties: block.properties,
        })),
      );
    const [lastNavigation] = await tx
      .select({ position: max(navigationItems.position) })
      .from(navigationItems)
      .where(
        and(
          eq(navigationItems.tenantId, input.tenantId),
          eq(navigationItems.siteId, site.id),
        ),
      );
    await tx.insert(navigationItems).values({
      id: randomUUID(),
      tenantId: input.tenantId,
      siteId: site.id,
      pageId,
      label: input.title,
      position: (lastNavigation?.position ?? -1) + 1,
      visible: false,
    });
    return {
      id: pageId,
      title: input.title,
      slug: input.slug,
      blocks: storedBlocks,
    };
  });
}

async function saveDraft(
  tenantId: string,
  userId: string,
  pageId: string,
  rawBlocks: unknown,
) {
  const blocks = parseStoredBlocks(rawBlocks);
  return db.transaction(async (tx) => {
    const [page] = await tx
      .select()
      .from(sitePages)
      .where(and(eq(sitePages.id, pageId), eq(sitePages.tenantId, tenantId)))
      .limit(1)
      .for("update");
    if (!page)
      throw new Error("Die Seite gehört nicht zum angemeldeten Mandanten.");
    const [existingDraft] = await tx
      .select()
      .from(pageVersions)
      .where(
        and(
          eq(pageVersions.pageId, pageId),
          eq(pageVersions.tenantId, tenantId),
          eq(pageVersions.state, "draft"),
        ),
      )
      .orderBy(desc(pageVersions.version))
      .limit(1);
    let versionId = existingDraft?.id;
    if (!versionId) {
      const [latest] = await tx
        .select({ value: max(pageVersions.version) })
        .from(pageVersions)
        .where(
          and(
            eq(pageVersions.pageId, pageId),
            eq(pageVersions.tenantId, tenantId),
          ),
        );
      versionId = randomUUID();
      await tx.insert(pageVersions).values({
        id: versionId,
        tenantId,
        pageId,
        version: (latest?.value ?? 0) + 1,
        state: "draft",
        title: page.title,
        createdByUserId: userId,
      });
    } else {
      await tx
        .delete(pageBlocks)
        .where(
          and(
            eq(pageBlocks.tenantId, tenantId),
            eq(pageBlocks.versionId, versionId),
          ),
        );
    }
    if (blocks.length)
      await tx.insert(pageBlocks).values(
        blocks.map((block) => ({
          id: randomUUID(),
          tenantId,
          versionId: versionId!,
          blockType: block.properties.type,
          schemaVersion: block.schemaVersion,
          position: block.position,
          visible: block.visible,
          properties: block.properties,
        })),
      );
    return versionId;
  });
}

export async function saveTenantBuilderDraft(input: {
  tenantId: string;
  userId: string;
  pageId: string;
  blocks: unknown;
}) {
  const versionId = await saveDraft(
    input.tenantId,
    input.userId,
    input.pageId,
    input.blocks,
  );
  return { versionId };
}

export async function publishTenantBuilderDraft(input: {
  tenantId: string;
  userId: string;
  pageId: string;
  blocks: unknown;
}) {
  const versionId = await saveDraft(
    input.tenantId,
    input.userId,
    input.pageId,
    input.blocks,
  );
  await db.transaction(async (tx) => {
    const [page] = await tx
      .select()
      .from(sitePages)
      .where(
        and(
          eq(sitePages.id, input.pageId),
          eq(sitePages.tenantId, input.tenantId),
        ),
      )
      .limit(1)
      .for("update");
    if (!page)
      throw new Error("Die Seite gehört nicht zum angemeldeten Mandanten.");
    await tx
      .update(pageVersions)
      .set({ state: "archived" })
      .where(
        and(
          eq(pageVersions.pageId, input.pageId),
          eq(pageVersions.tenantId, input.tenantId),
          eq(pageVersions.state, "published"),
        ),
      );
    await tx
      .update(pageVersions)
      .set({ state: "published" })
      .where(
        and(
          eq(pageVersions.id, versionId),
          eq(pageVersions.tenantId, input.tenantId),
        ),
      );
    await tx
      .update(sitePages)
      .set({ status: "published", publishedVersionId: versionId })
      .where(
        and(
          eq(sitePages.id, input.pageId),
          eq(sitePages.tenantId, input.tenantId),
        ),
      );
    await tx
      .update(navigationItems)
      .set({ visible: true })
      .where(
        and(
          eq(navigationItems.pageId, input.pageId),
          eq(navigationItems.tenantId, input.tenantId),
        ),
      );
  });
  return { versionId };
}
