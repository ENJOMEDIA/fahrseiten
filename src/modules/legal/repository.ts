import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, ne } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditLogs,
  legalDocuments,
  legalProfiles,
  locations,
  platformSettings,
  tenantMemberships,
  tenants,
  users,
} from "@/db/schema";
import type { LegalModuleSettings, LegalProfileData } from "@/db/schema";
import type { TenantContext } from "@/modules/tenancy/tenant-context";
import type { FeatureKey } from "@/modules/features/catalog";
import { findFeatureSources } from "@/modules/features/repository";
import {
  isFeatureUsable,
  resolveFeatureStatus,
} from "@/modules/features/service";

import { defaultLegalModules, validateLegalPublication } from "./documents";

export type LegalType = "imprint" | "privacy";

export type LegalProfile = {
  data: LegalProfileData;
  modules: LegalModuleSettings;
};

const featureLegalModuleMap: Partial<
  Record<FeatureKey, keyof LegalModuleSettings>
> = {
  lesson_booking: "onlineBooking",
  sms: "messaging",
  whatsapp: "messaging",
  payments: "payments",
  analytics: "analytics",
  ad_campaigns: "marketing",
};

export async function findRequiredTenantLegalModules(tenantId: string) {
  const entries = Object.entries(featureLegalModuleMap) as Array<
    [FeatureKey, keyof LegalModuleSettings]
  >;
  const sources = await Promise.all(
    entries.map(async ([feature, module]) => ({
      module,
      sources: await findFeatureSources(tenantId, feature),
    })),
  );
  return [
    "contactForm",
    "emailDelivery",
    "consentManagement",
    ...sources
      .filter(
        (entry) =>
          entry.sources && isFeatureUsable(resolveFeatureStatus(entry.sources)),
      )
      .map((entry) => entry.module),
  ].filter((module, index, all) => all.indexOf(module) === index) as Array<
    keyof LegalModuleSettings
  >;
}

export async function enforceRequiredTenantLegalModules(
  tenantId: string,
  modules: LegalModuleSettings,
) {
  const required = await findRequiredTenantLegalModules(tenantId);
  return required.reduce(
    (result, module) => ({ ...result, [module]: true }),
    modules,
  );
}

export async function findPlatformLegalProfile(): Promise<LegalProfile | null> {
  const [profile] = await db
    .select()
    .from(legalProfiles)
    .where(eq(legalProfiles.profileKey, "platform"))
    .limit(1);
  if (profile) return { data: profile.data, modules: profile.modules };

  const [settings] = await db.select().from(platformSettings).limit(1);
  if (!settings) return null;
  return {
    data: {
      companyName: settings.companyName,
      legalForm: "other",
      representativeName: settings.ownerName,
      street: settings.street,
      postalCode: settings.postalCode,
      city: settings.city,
      country: "Deutschland",
      email: settings.contactEmail,
      phone: settings.phone ?? "",
      registerType: "none",
      registerCourt: "",
      registerNumber: "",
      vatId: "",
      regulatedActivity: false,
      supervisoryAuthority: "",
      journalisticContent: false,
      editorialResponsible: "",
      privacyContactEmail: settings.contactEmail,
      dataProtectionOfficerRequired: false,
      dataProtectionOfficerEmail: "",
      hostingProvider: "netcup GmbH",
      inquiryRetentionMonths: 6,
    },
    modules: defaultLegalModules,
  };
}

export async function findTenantLegalProfile(
  context: TenantContext,
): Promise<LegalProfile | null> {
  const [profile] = await db
    .select()
    .from(legalProfiles)
    .where(
      and(
        eq(legalProfiles.profileKey, context.tenantId),
        eq(legalProfiles.tenantId, context.tenantId),
      ),
    )
    .limit(1);
  if (profile) return { data: profile.data, modules: profile.modules };

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, context.tenantId))
    .limit(1);
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.tenantId, context.tenantId))
    .limit(1);
  const [owner] = await db
    .select({ name: users.displayName, email: users.email })
    .from(tenantMemberships)
    .innerJoin(users, eq(users.id, tenantMemberships.userId))
    .where(
      and(
        eq(tenantMemberships.tenantId, context.tenantId),
        eq(tenantMemberships.role, "tenant_owner"),
      ),
    )
    .limit(1);
  if (!tenant || !location || !owner) return null;
  return {
    data: {
      companyName: tenant.name,
      legalForm: "other",
      representativeName: owner.name,
      street: location.street,
      postalCode: location.postalCode,
      city: location.city,
      country: "Deutschland",
      email: location.email ?? owner.email,
      phone: location.phone ?? "",
      registerType: "none",
      registerCourt: "",
      registerNumber: "",
      vatId: "",
      regulatedActivity: true,
      supervisoryAuthority: "",
      journalisticContent: false,
      editorialResponsible: "",
      privacyContactEmail: owner.email,
      dataProtectionOfficerRequired: false,
      dataProtectionOfficerEmail: "",
      hostingProvider: "netcup GmbH",
      inquiryRetentionMonths: 6,
    },
    modules: defaultLegalModules,
  };
}

export async function savePlatformLegalProfile(
  actorUserId: string,
  profile: LegalProfile,
) {
  await db
    .insert(legalProfiles)
    .values({
      profileKey: "platform",
      scope: "platform",
      data: profile.data,
      modules: profile.modules,
      updatedByUserId: actorUserId,
    })
    .onDuplicateKeyUpdate({
      set: {
        data: profile.data,
        modules: profile.modules,
        updatedByUserId: actorUserId,
        updatedAt: new Date(),
      },
    });
}

export async function saveTenantLegalProfile(
  context: TenantContext,
  profile: LegalProfile,
) {
  await db
    .insert(legalProfiles)
    .values({
      profileKey: context.tenantId,
      tenantId: context.tenantId,
      scope: "tenant",
      data: profile.data,
      modules: profile.modules,
      updatedByUserId: context.userId,
    })
    .onDuplicateKeyUpdate({
      set: {
        data: profile.data,
        modules: profile.modules,
        updatedByUserId: context.userId,
        updatedAt: new Date(),
      },
    });
}

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
