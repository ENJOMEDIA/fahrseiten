import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  auditLogs,
  backgroundJobs,
  domains,
  legalDocuments,
  mediaAssets,
  sites,
  subscriptions,
  plans,
  tenantMemberships,
  tenantOnboardingTokens,
  tenants,
  users,
} from "@/db/schema";
import { getMediaStorage } from "@/modules/media/runtime-storage";

export async function listPlatformTenants() {
  return db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      domain: domains.hostname,
      domainStatus: domains.status,
      sslStatus: domains.sslStatus,
      maintenanceMode: sites.maintenanceMode,
      ownerName: users.displayName,
      ownerEmail: users.email,
      planName: plans.publicName,
    })
    .from(tenants)
    .leftJoin(
      domains,
      and(eq(domains.tenantId, tenants.id), eq(domains.primary, true)),
    )
    .leftJoin(sites, eq(sites.tenantId, tenants.id))
    .leftJoin(
      tenantMemberships,
      and(
        eq(tenantMemberships.tenantId, tenants.id),
        eq(tenantMemberships.role, "tenant_owner"),
        eq(tenantMemberships.active, true),
      ),
    )
    .leftJoin(users, eq(users.id, tenantMemberships.userId))
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenants.id),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .orderBy(desc(tenants.createdAt));
}

export async function listPendingInstanceSetups() {
  const setups = await db
    .select({
      id: tenantOnboardingTokens.id,
      prefill: tenantOnboardingTokens.prefill,
      expiresAt: tenantOnboardingTokens.expiresAt,
      createdAt: tenantOnboardingTokens.createdAt,
    })
    .from(tenantOnboardingTokens)
    .where(isNull(tenantOnboardingTokens.usedAt))
    .orderBy(desc(tenantOnboardingTokens.createdAt))
    .limit(100);
  const keys = setups.map((setup) => `instance-invitation:${setup.id}`);
  const jobs = keys.length
    ? await db
        .select({
          idempotencyKey: backgroundJobs.idempotencyKey,
          status: backgroundJobs.status,
          lastErrorCode: backgroundJobs.lastErrorCode,
          completedAt: backgroundJobs.completedAt,
        })
        .from(backgroundJobs)
        .where(inArray(backgroundJobs.idempotencyKey, keys))
    : [];
  const jobByKey = new Map(jobs.map((job) => [job.idempotencyKey, job]));
  return setups
    .filter((setup) => setup.prefill)
    .map((setup) => ({
      ...setup,
      prefill: setup.prefill!,
      invitation: jobByKey.get(`instance-invitation:${setup.id}`) ?? null,
    }));
}

export async function cancelPendingInstanceSetup(input: {
  setupId: string;
  confirmation: string;
  actorUserId: string;
}) {
  return db.transaction(async (tx) => {
    const [setup] = await tx
      .select({
        id: tenantOnboardingTokens.id,
        prefill: tenantOnboardingTokens.prefill,
        usedAt: tenantOnboardingTokens.usedAt,
      })
      .from(tenantOnboardingTokens)
      .where(eq(tenantOnboardingTokens.id, input.setupId))
      .limit(1)
      .for("update");
    if (!setup)
      throw new Error("Die vorbereitete Instanz wurde nicht gefunden.");
    if (setup.usedAt)
      throw new Error(
        "Die Einrichtung wurde bereits abgeschlossen und kann hier nicht mehr storniert werden.",
      );
    const displayName = setup.prefill?.companyName || "Unbenannte Instanz";
    if (input.confirmation.trim() !== displayName)
      throw new Error("Der eingegebene Name stimmt nicht exakt überein.");

    await tx
      .delete(backgroundJobs)
      .where(
        eq(backgroundJobs.idempotencyKey, `instance-invitation:${setup.id}`),
      );
    await tx
      .delete(tenantOnboardingTokens)
      .where(eq(tenantOnboardingTokens.id, setup.id));
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: input.actorUserId,
      action: "tenant.onboarding.cancelled",
      entityType: "tenant_onboarding",
      entityId: setup.id,
      metadata: { companyName: displayName },
    });
    return { displayName };
  });
}

export async function findPlatformTenant(id: string) {
  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      updatedAt: tenants.updatedAt,
      domain: domains.hostname,
      domainId: domains.id,
      domainStatus: domains.status,
      sslStatus: domains.sslStatus,
      maintenanceMode: sites.maintenanceMode,
      maintenanceMessage: sites.maintenanceMessage,
      ownerName: users.displayName,
      ownerEmail: users.email,
      ownerActive: users.active,
      planName: plans.publicName,
    })
    .from(tenants)
    .leftJoin(
      domains,
      and(eq(domains.tenantId, tenants.id), eq(domains.primary, true)),
    )
    .leftJoin(sites, eq(sites.tenantId, tenants.id))
    .leftJoin(
      tenantMemberships,
      and(
        eq(tenantMemberships.tenantId, tenants.id),
        eq(tenantMemberships.role, "tenant_owner"),
        eq(tenantMemberships.active, true),
      ),
    )
    .leftJoin(users, eq(users.id, tenantMemberships.userId))
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenants.id),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(tenants.id, id))
    .limit(1);

  if (!tenant) return null;
  const publishedLegal = await db
    .select({ documentType: legalDocuments.documentType })
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.tenantId, tenant.id),
        eq(legalDocuments.status, "published"),
      ),
    );
  return {
    ...tenant,
    publishedLegal: new Set(publishedLegal.map((row) => row.documentType)),
  };
}

export async function deletePlatformTenant(input: {
  tenantId: string;
  confirmation: string;
  actorUserId: string;
}) {
  const [tenant] = await db
    .select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, input.tenantId))
    .limit(1);
  if (!tenant) throw new Error("Der Mandant wurde nicht gefunden.");
  if (input.confirmation.trim() !== tenant.name)
    throw new Error(
      "Der eingegebene Mandantenname stimmt nicht exakt überein.",
    );

  const storageKeys = await db.transaction(async (tx) => {
    const assets = await tx
      .select({
        storageKey: mediaAssets.storageKey,
        optimizedStorageKey: mediaAssets.optimizedStorageKey,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.tenantId, tenant.id));
    const memberships = await tx
      .select({ userId: tenantMemberships.userId })
      .from(tenantMemberships)
      .where(eq(tenantMemberships.tenantId, tenant.id));

    await tx.delete(tenants).where(eq(tenants.id, tenant.id));

    for (const membership of memberships) {
      const remainingMembership = await tx
        .select({ userId: tenantMemberships.userId })
        .from(tenantMemberships)
        .where(eq(tenantMemberships.userId, membership.userId))
        .limit(1);
      const user = await tx
        .select({ platformRole: users.platformRole })
        .from(users)
        .where(eq(users.id, membership.userId))
        .limit(1);
      if (!remainingMembership[0] && user[0]?.platformRole === null)
        await tx.delete(users).where(eq(users.id, membership.userId));
    }

    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: input.actorUserId,
      action: "tenant.deleted",
      entityType: "tenant",
      entityId: tenant.id,
      metadata: { mediaFiles: assets.length },
    });
    return assets.flatMap((asset) =>
      asset.optimizedStorageKey
        ? [asset.storageKey, asset.optimizedStorageKey]
        : [asset.storageKey],
    );
  });

  const cleanup = await Promise.allSettled(
    storageKeys.map((key) => getMediaStorage().delete(key)),
  );
  return {
    deletedTenantName: tenant.name,
    failedMediaFiles: cleanup.filter((result) => result.status === "rejected")
      .length,
  };
}
