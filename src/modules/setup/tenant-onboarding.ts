import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditLogs,
  backgroundJobs,
  billingProfiles,
  contactForms,
  domains,
  legalDocuments,
  legalProfiles,
  locations,
  navigationItems,
  pageBlocks,
  pageVersions,
  salesActivities,
  salesLeads,
  sitePages,
  sites,
  tenantMemberships,
  tenantOnboardingTokens,
  tenants,
  themeSettings,
  users,
} from "@/db/schema";
import { env } from "@/config/env";
import { hashPassword } from "@/modules/auth/password";
import { createOpaqueToken, hashToken } from "@/modules/auth/tokens";
import { normalizeHostname } from "@/modules/domains/hostname";
import { customerNumberFromTenantId } from "@/modules/platform/customer-reference";
import {
  createInitialLegalProfile,
  createLegalDrafts,
} from "@/modules/legal/documents";

import { SetupInputError } from "./error";
import { tenantOnboardingSchema } from "./schemas";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export type TenantSetupPrefill = {
  companyName?: string;
  ownerName?: string;
  ownerEmail?: string;
  phone?: string;
  domain?: string;
};

export async function createTenantOnboardingLink(input: {
  createdByUserId: string;
  leadId?: string;
  prefill: TenantSetupPrefill;
  publicOrigin: string;
  sendInvitation: boolean;
}) {
  const token = createOpaqueToken();
  const tokenId = randomUUID();
  const actionUrl = new URL(
    `/onboarding/${token}`,
    input.publicOrigin,
  ).toString();
  await db.transaction(async (tx) => {
    const matchingLeads = input.leadId
      ? await tx
          .select()
          .from(salesLeads)
          .where(eq(salesLeads.id, input.leadId))
          .limit(1)
      : input.prefill.ownerEmail
        ? await tx
            .select()
            .from(salesLeads)
            .where(eq(salesLeads.email, input.prefill.ownerEmail))
            .limit(2)
        : [];
    if (!input.leadId && matchingLeads.length > 1)
      throw new Error(
        "Zur E-Mail-Adresse existieren mehrere Leads. Starte die Instanzerstellung beim gewünschten Lead im Akquise-Bereich.",
      );
    const selectedLead = matchingLeads[0];
    if (input.leadId && !selectedLead)
      throw new Error("Der ausgewählte Akquise-Lead wurde nicht gefunden.");
    if (selectedLead?.convertedTenantId)
      throw new Error("Dieser Lead ist bereits mit einer Instanz verbunden.");
    const leadId = selectedLead?.id ?? randomUUID();
    const [pendingSetup] = selectedLead
      ? await tx
          .select({ id: tenantOnboardingTokens.id })
          .from(tenantOnboardingTokens)
          .where(
            and(
              eq(tenantOnboardingTokens.leadId, leadId),
              isNull(tenantOnboardingTokens.usedAt),
              gt(tenantOnboardingTokens.expiresAt, new Date()),
            ),
          )
          .limit(1)
      : [];
    if (pendingSetup)
      throw new Error(
        "Für diesen Lead existiert bereits ein gültiger Einrichtungslink.",
      );
    if (!selectedLead)
      await tx.insert(salesLeads).values({
        id: leadId,
        companyName: input.prefill.companyName || "Vorbereitete Instanz",
        contactName: input.prefill.ownerName || null,
        email: input.prefill.ownerEmail || null,
        phone: input.prefill.phone || null,
        website: input.prefill.domain
          ? /^(https?:\/\/)/i.test(input.prefill.domain)
            ? input.prefill.domain
            : `https://${input.prefill.domain}`
          : null,
        source: "instance_setup",
        status: "interested",
        ownerUserId: input.createdByUserId,
      });
    await tx.insert(tenantOnboardingTokens).values({
      id: tokenId,
      leadId,
      tokenHash: hashToken(token),
      createdByUserId: input.createdByUserId,
      prefill: input.prefill,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
    });
    if (input.sendInvitation && input.prefill.ownerEmail) {
      await tx.insert(backgroundJobs).values({
        id: randomUUID(),
        type: "notification",
        idempotencyKey: `instance-invitation:${tokenId}`,
        payload: {
          to: input.prefill.ownerEmail,
          from: env.SMTP_FROM,
          template: "instance_invitation",
          values: {
            companyName: input.prefill.companyName || "Ihre Fahrschule",
            contactName: input.prefill.ownerName || "Fahrschul-Team",
            actionUrl,
            expiresInDays: 7,
          },
        },
        runAt: new Date(),
      });
    }
    await tx.insert(salesActivities).values({
      id: randomUUID(),
      leadId,
      actorUserId: input.createdByUserId,
      activityType: "instance_setup_created",
      note: input.sendInvitation
        ? "Instanz vorbereitet und Einladungs-E-Mail eingeplant."
        : "Instanz vorbereitet und persönlicher Einrichtungslink erstellt.",
    });
  });
  return { token, tokenId, actionUrl };
}

export async function findInstanceInvitationStatus(tokenId: string) {
  const [job] = await db
    .select({
      status: backgroundJobs.status,
      lastErrorCode: backgroundJobs.lastErrorCode,
    })
    .from(backgroundJobs)
    .where(eq(backgroundJobs.idempotencyKey, `instance-invitation:${tokenId}`))
    .limit(1);
  return job ?? null;
}

export async function findTenantOnboardingPrefill(token: string) {
  if (token.length < 32) return null;
  if (env.DEMO_DATA_MODE === "fixture") return null;
  const [row] = await db
    .select({ prefill: tenantOnboardingTokens.prefill })
    .from(tenantOnboardingTokens)
    .where(
      and(
        eq(tenantOnboardingTokens.tokenHash, hashToken(token)),
        isNull(tenantOnboardingTokens.usedAt),
        gt(tenantOnboardingTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row?.prefill ?? null;
}

export async function completeTenantOnboarding(input: unknown) {
  const parsed = tenantOnboardingSchema.parse(input);
  let hostname: string;
  try {
    hostname = normalizeHostname(parsed.domain);
  } catch {
    throw new SetupInputError(
      "Bitte eine gültige Domain ohne Protokoll oder Pfad angeben.",
    );
  }
  const slugBase = slugify(parsed.companyName);
  if (!slugBase)
    throw new SetupInputError("Der Fahrschulname ergibt keinen gültigen Slug.");

  return db.transaction(async (tx) => {
    const [onboarding] = await tx
      .select()
      .from(tenantOnboardingTokens)
      .where(
        and(
          eq(tenantOnboardingTokens.tokenHash, hashToken(parsed.token)),
          isNull(tenantOnboardingTokens.usedAt),
          gt(tenantOnboardingTokens.expiresAt, new Date()),
        ),
      )
      .limit(1)
      .for("update");
    if (!onboarding)
      throw new SetupInputError(
        "Der Onboarding-Link ist ungültig oder abgelaufen.",
      );

    const [emailInUse] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.ownerEmail))
      .limit(1);
    if (emailInUse)
      throw new SetupInputError("Die E-Mail-Adresse wird bereits verwendet.");

    const [domainInUse] = await tx
      .select({ id: domains.id })
      .from(domains)
      .where(eq(domains.hostname, hostname))
      .limit(1);
    if (domainInUse)
      throw new SetupInputError(
        "Die Domain ist bereits einer Fahrschule zugeordnet.",
      );

    let slug = slugBase;
    const [slugInUse] = await tx
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    if (slugInUse) slug = `${slugBase}-${randomUUID().slice(0, 6)}`;

    const tenantId = randomUUID();
    const customerNumber = customerNumberFromTenantId(tenantId);
    const ownerId = randomUUID();
    const siteId = randomUUID();
    const pageId = randomUUID();
    const versionId = randomUUID();
    const passwordHash = await hashPassword(parsed.ownerPassword);
    const legalDrafts = createLegalDrafts({
      ...parsed,
      ownerName: parsed.ownerName,
      email: parsed.ownerEmail,
    });
    const legalProfile = createInitialLegalProfile(
      { ...parsed, ownerName: parsed.ownerName, email: parsed.ownerEmail },
      { regulatedActivity: true },
    );

    await tx.insert(tenants).values({
      id: tenantId,
      customerNumber,
      name: parsed.companyName,
      slug,
    });
    await tx.insert(users).values({
      id: ownerId,
      email: parsed.ownerEmail,
      displayName: parsed.ownerName,
      passwordHash,
    });
    await tx
      .insert(tenantMemberships)
      .values({ tenantId, userId: ownerId, role: "tenant_owner" });
    await tx.insert(sites).values({
      id: siteId,
      tenantId,
      name: `${parsed.companyName} Website`,
      maintenanceMode: true,
      maintenanceMessage: parsed.maintenanceMessage,
    });
    await tx.insert(themeSettings).values({
      tenantId,
      siteId,
      primaryColor: parsed.primaryColor,
      accentColor: parsed.accentColor,
    });
    await tx.insert(locations).values({
      id: randomUUID(),
      tenantId,
      name: "Hauptstandort",
      street: parsed.street,
      postalCode: parsed.postalCode,
      city: parsed.city,
      phone: parsed.phone || null,
      email: parsed.ownerEmail,
    });
    await tx.insert(billingProfiles).values({
      tenantId,
      useLocationAddress: parsed.billingUseLocationAddress,
      companyName: parsed.billingUseLocationAddress
        ? parsed.companyName
        : parsed.billingCompanyName!,
      recipientName: parsed.billingUseLocationAddress
        ? parsed.ownerName
        : parsed.billingRecipientName || null,
      email: parsed.billingUseLocationAddress
        ? parsed.ownerEmail
        : parsed.billingEmail!,
      street: parsed.billingUseLocationAddress
        ? parsed.street
        : parsed.billingStreet!,
      postalCode: parsed.billingUseLocationAddress
        ? parsed.postalCode
        : parsed.billingPostalCode!,
      city: parsed.billingUseLocationAddress
        ? parsed.city
        : parsed.billingCity!,
      country: parsed.billingUseLocationAddress
        ? "Deutschland"
        : parsed.billingCountry!,
      vatId: parsed.vatId || null,
    });
    await tx.insert(domains).values({
      id: randomUUID(),
      tenantId,
      hostname,
      status: "pending",
      primary: true,
    });
    await tx.insert(contactForms).values({
      id: randomUUID(),
      tenantId,
      name: "Allgemeine Kontaktanfrage",
      privacyTextVersion: "pending-legal-review",
      requiredFields: ["contactName", "email", "message"],
    });
    await tx.insert(legalProfiles).values({
      profileKey: tenantId,
      tenantId,
      scope: "tenant",
      data: legalProfile.data,
      modules: legalProfile.modules,
      updatedByUserId: ownerId,
    });
    await tx.insert(legalDocuments).values([
      {
        id: randomUUID(),
        tenantId,
        scope: "tenant",
        documentType: "imprint",
        version: 1,
        status: "draft",
        content: legalDrafts.imprint,
        createdByUserId: ownerId,
      },
      {
        id: randomUUID(),
        tenantId,
        scope: "tenant",
        documentType: "privacy",
        version: 1,
        status: "draft",
        content: legalDrafts.privacy,
        createdByUserId: ownerId,
      },
    ]);
    await tx.insert(sitePages).values({
      id: pageId,
      tenantId,
      siteId,
      slug: "",
      title: "Start",
      status: "published",
      publishedVersionId: versionId,
    });
    await tx.insert(pageVersions).values({
      id: versionId,
      tenantId,
      pageId,
      version: 1,
      state: "published",
      title: parsed.companyName,
      createdByUserId: ownerId,
    });
    await tx.insert(pageBlocks).values([
      {
        id: randomUUID(),
        tenantId,
        versionId,
        blockType: "hero",
        position: 0,
        properties: {
          type: "hero",
          eyebrow: `Fahrschule in ${parsed.city}`,
          heading: parsed.companyName,
          text: "Willkommen auf unserer neuen Fahrschulwebsite. Inhalte und Angebote werden im Kundenbereich vervollständigt.",
          actionLabel: "Kontakt aufnehmen",
          actionHref: "mailto:" + parsed.ownerEmail,
        },
      },
      {
        id: randomUUID(),
        tenantId,
        versionId,
        blockType: "contact_teaser",
        position: 1,
        properties: {
          type: "contact_teaser",
          heading: "Wir sind für dich da",
          text: `${parsed.street}, ${parsed.postalCode} ${parsed.city}`,
          phone: parsed.phone || undefined,
          email: parsed.ownerEmail,
        },
      },
    ]);
    await tx.insert(navigationItems).values({
      id: randomUUID(),
      tenantId,
      siteId,
      pageId,
      label: "Start",
      position: 0,
    });
    await tx
      .update(tenantOnboardingTokens)
      .set({ usedAt: new Date() })
      .where(eq(tenantOnboardingTokens.id, onboarding.id));

    if (!onboarding.leadId)
      throw new SetupInputError(
        "Die Einrichtung besitzt keine feste Akquise-Zuordnung.",
      );
    await tx
      .update(salesLeads)
      .set({ status: "won", convertedTenantId: tenantId })
      .where(eq(salesLeads.id, onboarding.leadId));
    await tx.insert(salesActivities).values({
      id: randomUUID(),
      leadId: onboarding.leadId,
      actorUserId: onboarding.createdByUserId,
      activityType: "tenant_created",
      note: `Kundenakte ${customerNumber} und Instanz wurden angelegt.`,
    });
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      tenantId,
      actorUserId: onboarding.createdByUserId,
      action: "tenant.onboarding.completed",
      entityType: "tenant",
      entityId: tenantId,
      metadata: { domain: hostname },
    });

    return { tenantId, hostname, status: "created" as const };
  });
}
