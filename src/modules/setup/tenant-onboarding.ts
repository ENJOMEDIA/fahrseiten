import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditLogs,
  contactForms,
  domains,
  locations,
  navigationItems,
  pageBlocks,
  pageVersions,
  sitePages,
  sites,
  tenantMemberships,
  tenantOnboardingTokens,
  tenants,
  themeSettings,
  users,
} from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";
import { createOpaqueToken, hashToken } from "@/modules/auth/tokens";
import { normalizeHostname } from "@/modules/domains/hostname";

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

export async function createTenantOnboardingLink(createdByUserId: string) {
  const token = createOpaqueToken();
  await db.insert(tenantOnboardingTokens).values({
    id: randomUUID(),
    tokenHash: hashToken(token),
    createdByUserId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
  });
  return token;
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
    const ownerId = randomUUID();
    const siteId = randomUUID();
    const pageId = randomUUID();
    const versionId = randomUUID();
    const passwordHash = await hashPassword(parsed.ownerPassword);

    await tx
      .insert(tenants)
      .values({ id: tenantId, name: parsed.companyName, slug });
    await tx.insert(users).values({
      id: ownerId,
      email: parsed.ownerEmail,
      displayName: parsed.ownerName,
      passwordHash,
    });
    await tx
      .insert(tenantMemberships)
      .values({ tenantId, userId: ownerId, role: "tenant_owner" });
    await tx
      .insert(sites)
      .values({ id: siteId, tenantId, name: `${parsed.companyName} Website` });
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
