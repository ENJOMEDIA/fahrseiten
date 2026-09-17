import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, ne } from "drizzle-orm";

import { db } from "@/db/client";
import { auditLogs, legalDocuments } from "@/db/schema";
import type { TenantContext } from "@/modules/tenancy/tenant-context";

import { validateLegalPublication } from "./documents";

export type LegalType = "imprint" | "privacy";

export async function findLatestTenantLegalDocuments(context: TenantContext) {
  return db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "tenant"),
        eq(legalDocuments.tenantId, context.tenantId),
      ),
    )
    .orderBy(desc(legalDocuments.version));
}

export async function findPublishedTenantLegalDocument(
  tenantId: string,
  type: LegalType,
) {
  const [document] = await db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "tenant"),
        eq(legalDocuments.tenantId, tenantId),
        eq(legalDocuments.documentType, type),
        eq(legalDocuments.status, "published"),
      ),
    )
    .orderBy(desc(legalDocuments.version))
    .limit(1);
  return document ?? null;
}

export async function saveTenantLegalDocument(
  context: TenantContext,
  input: { type: LegalType; content: string; publish: boolean },
) {
  const documents = await db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "tenant"),
        eq(legalDocuments.tenantId, context.tenantId),
        eq(legalDocuments.documentType, input.type),
      ),
    )
    .orderBy(desc(legalDocuments.version));
  const latest = documents[0];
  const version =
    latest?.status === "draft" ? latest.version : (latest?.version ?? 0) + 1;
  const id = latest?.status === "draft" ? latest.id : randomUUID();

  if (input.publish) {
    validateLegalPublication({
      type: input.type,
      content: input.content,
      version,
      warningAcknowledged: true,
    });
    if (input.content.includes("["))
      throw new Error(
        "Vor der Veröffentlichung müssen alle Platzhalter entfernt werden.",
      );
  }

  await db.transaction(async (tx) => {
    if (latest?.status === "draft") {
      await tx
        .update(legalDocuments)
        .set({
          content: input.content,
          status: input.publish ? "published" : "draft",
          publishedAt: input.publish ? new Date() : null,
          effectiveAt: input.publish ? new Date() : null,
          warningAcknowledgedAt: input.publish ? new Date() : null,
        })
        .where(
          and(
            eq(legalDocuments.id, id),
            eq(legalDocuments.tenantId, context.tenantId),
          ),
        );
    } else {
      await tx.insert(legalDocuments).values({
        id,
        tenantId: context.tenantId,
        scope: "tenant",
        documentType: input.type,
        version,
        status: input.publish ? "published" : "draft",
        content: input.content,
        publishedAt: input.publish ? new Date() : null,
        effectiveAt: input.publish ? new Date() : null,
        warningAcknowledgedAt: input.publish ? new Date() : null,
        createdByUserId: context.userId,
      });
    }
    if (input.publish) {
      await tx
        .update(legalDocuments)
        .set({ status: "archived" })
        .where(
          and(
            eq(legalDocuments.scope, "tenant"),
            eq(legalDocuments.tenantId, context.tenantId),
            eq(legalDocuments.documentType, input.type),
            eq(legalDocuments.status, "published"),
            ne(legalDocuments.id, id),
          ),
        );
    }
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: input.publish ? "legal.published" : "legal.draft.saved",
      entityType: "legal_document",
      entityId: id,
      metadata: { type: input.type, version },
    });
  });
}

export async function tenantHasPublishedLegalDocuments(tenantId: string) {
  const documents = await db
    .select({ type: legalDocuments.documentType })
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "tenant"),
        eq(legalDocuments.tenantId, tenantId),
        eq(legalDocuments.status, "published"),
      ),
    );
  const types = new Set(documents.map((document) => document.type));
  return types.has("imprint") && types.has("privacy");
}

export async function findLatestPlatformLegalDocuments() {
  return db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "platform"),
        isNull(legalDocuments.tenantId),
      ),
    )
    .orderBy(desc(legalDocuments.version));
}

export async function findPublishedPlatformLegalDocument(type: LegalType) {
  const [document] = await db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "platform"),
        isNull(legalDocuments.tenantId),
        eq(legalDocuments.documentType, type),
        eq(legalDocuments.status, "published"),
      ),
    )
    .orderBy(desc(legalDocuments.version))
    .limit(1);
  return document ?? null;
}

export async function savePlatformLegalDocument(
  actorUserId: string,
  input: { type: LegalType; content: string; publish: boolean },
) {
  const documents = await db
    .select()
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "platform"),
        isNull(legalDocuments.tenantId),
        eq(legalDocuments.documentType, input.type),
      ),
    )
    .orderBy(desc(legalDocuments.version));
  const latest = documents[0];
  const version =
    latest?.status === "draft" ? latest.version : (latest?.version ?? 0) + 1;
  const id = latest?.status === "draft" ? latest.id : randomUUID();
  if (input.publish) {
    validateLegalPublication({
      type: input.type,
      content: input.content,
      version,
      warningAcknowledged: true,
    });
    if (input.content.includes("["))
      throw new Error(
        "Vor der Veröffentlichung müssen alle Platzhalter entfernt werden.",
      );
  }
  await db.transaction(async (tx) => {
    if (latest?.status === "draft") {
      await tx
        .update(legalDocuments)
        .set({
          content: input.content,
          status: input.publish ? "published" : "draft",
          publishedAt: input.publish ? new Date() : null,
          effectiveAt: input.publish ? new Date() : null,
          warningAcknowledgedAt: input.publish ? new Date() : null,
        })
        .where(eq(legalDocuments.id, id));
    } else {
      await tx.insert(legalDocuments).values({
        id,
        scope: "platform",
        documentType: input.type,
        version,
        status: input.publish ? "published" : "draft",
        content: input.content,
        publishedAt: input.publish ? new Date() : null,
        effectiveAt: input.publish ? new Date() : null,
        warningAcknowledgedAt: input.publish ? new Date() : null,
        createdByUserId: actorUserId,
      });
    }
    if (input.publish)
      await tx
        .update(legalDocuments)
        .set({ status: "archived" })
        .where(
          and(
            eq(legalDocuments.scope, "platform"),
            isNull(legalDocuments.tenantId),
            eq(legalDocuments.documentType, input.type),
            eq(legalDocuments.status, "published"),
            ne(legalDocuments.id, id),
          ),
        );
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId,
      action: input.publish ? "legal.published" : "legal.draft.saved",
      entityType: "legal_document",
      entityId: id,
      metadata: { scope: "platform", type: input.type, version },
    });
  });
}

export async function platformHasPublishedLegalDocuments() {
  const documents = await db
    .select({ type: legalDocuments.documentType })
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.scope, "platform"),
        isNull(legalDocuments.tenantId),
        eq(legalDocuments.status, "published"),
      ),
    );
  const types = new Set(documents.map((document) => document.type));
  return types.has("imprint") && types.has("privacy");
}
