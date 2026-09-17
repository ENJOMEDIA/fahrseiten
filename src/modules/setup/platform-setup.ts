import "server-only";

import { randomUUID, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";

import { env } from "@/config/env";
import { db } from "@/db/client";
import {
  auditLogs,
  legalDocuments,
  platformSettings,
  users,
} from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";
import { createLegalDrafts } from "@/modules/legal/documents";

import { SetupInputError } from "./error";
import { platformSetupSchema } from "./schemas";

const SETTINGS_ID = "00000000-0000-4000-8000-000000000100";

function tokenMatches(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function completePlatformSetup(input: unknown) {
  const parsed = platformSetupSchema.parse(input);
  if (
    !env.INSTALL_TOKEN ||
    !tokenMatches(parsed.installToken, env.INSTALL_TOKEN)
  ) {
    throw new SetupInputError("Der Installationscode ist ungültig.");
  }

  await migrate(db, { migrationsFolder: "./drizzle" });

  const [existingOwner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.platformRole, "platform_owner"))
    .limit(1);
  if (existingOwner) return { status: "already_installed" as const };

  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.email))
    .limit(1);
  if (existingEmail) {
    throw new SetupInputError("Die E-Mail-Adresse wird bereits verwendet.");
  }

  const ownerId = randomUUID();
  const passwordHash = await hashPassword(parsed.password);
  const legalDrafts = createLegalDrafts({
    ...parsed,
    ownerName: parsed.ownerName,
    email: parsed.email,
  });
  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: ownerId,
      email: parsed.email,
      displayName: parsed.ownerName,
      passwordHash,
      platformRole: "platform_owner",
    });
    await tx.insert(platformSettings).values({
      id: SETTINGS_ID,
      brandName: parsed.brandName,
      companyName: parsed.companyName,
      ownerName: parsed.ownerName,
      contactEmail: parsed.email,
      phone: parsed.phone || null,
      street: parsed.street,
      postalCode: parsed.postalCode,
      city: parsed.city,
      primaryColor: parsed.primaryColor,
      accentColor: parsed.accentColor,
      maintenanceMode: true,
      maintenanceMessage: parsed.maintenanceMessage,
      setupCompletedAt: new Date(),
    });
    await tx.insert(legalDocuments).values([
      {
        id: randomUUID(),
        scope: "platform",
        documentType: "imprint",
        version: 1,
        status: "draft",
        content: legalDrafts.imprint,
        createdByUserId: ownerId,
      },
      {
        id: randomUUID(),
        scope: "platform",
        documentType: "privacy",
        version: 1,
        status: "draft",
        content: legalDrafts.privacy,
        createdByUserId: ownerId,
      },
    ]);
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: ownerId,
      action: "platform.setup.completed",
      entityType: "platform",
      entityId: SETTINGS_ID,
      metadata: { source: "web_installer" },
    });
  });
  return { status: "installed" as const };
}
