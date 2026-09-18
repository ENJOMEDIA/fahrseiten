import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, max } from "drizzle-orm";

import { db } from "@/db/client";
import { pageBlocks, pageVersions, sitePages } from "@/db/schema";
import {
  parseStoredBlocks,
  type StoredBlock,
} from "@/modules/cms/block-schema";

export type TenantBuilderPage = {
  id: string;
  title: string;
  slug: string;
  blocks: StoredBlock[];
};

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
  return selected.map(({ page, version }) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    blocks: parseStoredBlocks(
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
  }));
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
  });
  return { versionId };
}
