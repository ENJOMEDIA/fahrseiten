import "server-only";

import { randomUUID, timingSafeEqual } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

import { env } from "@/config/env";
import {
  buildMysqlUrl,
  readRuntimeConfig,
  writeRuntimeConfig,
} from "@/config/runtime-config";
import * as databaseSchema from "@/db/schema";
import {
  auditLogs,
  legalDocuments,
  legalProfiles,
  platformSettings,
  users,
} from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";
import {
  createInitialLegalProfile,
  createLegalDrafts,
} from "@/modules/legal/documents";

import { SetupInputError } from "./error";
import { platformSetupSchema } from "./schemas";

const SETTINGS_ID = "00000000-0000-4000-8000-000000000100";

function tokenMatches(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function persistInstallation(databaseUrl: string) {
  try {
    await writeRuntimeConfig({
      version: 1,
      installationCompletedAt: new Date().toISOString(),
      databaseUrl,
    });
  } catch {
    throw new SetupInputError(
      "Die persistente Konfiguration konnte nicht gespeichert werden. Bitte Pfad und Schreibrechte von FAHRSEITEN_CONFIG_FILE prüfen.",
    );
  }
}

export async function completePlatformSetup(input: unknown) {
  if (await readRuntimeConfig()) {
    return { status: "already_installed" as const };
  }

  const parsed = platformSetupSchema.parse(input);
  if (
    !env.INSTALL_TOKEN ||
    !tokenMatches(parsed.installToken, env.INSTALL_TOKEN)
  ) {
    throw new SetupInputError("Der Installationscode ist ungültig.");
  }

  const databaseUrl = buildMysqlUrl({
    host: parsed.databaseHost,
    port: parsed.databasePort,
    database: parsed.databaseName,
    user: parsed.databaseUser,
    password: parsed.databasePassword,
  });
  let connection: mysql.Connection;
  try {
    connection = await mysql.createConnection({
      uri: databaseUrl,
      connectTimeout: 10_000,
    });
  } catch {
    throw new SetupInputError(
      "Die Datenbankverbindung ist fehlgeschlagen. Bitte Host, Port, Datenbankname, Benutzer und Passwort prüfen.",
    );
  }
  const setupDb = drizzle({
    client: connection,
    schema: databaseSchema,
    mode: "default",
  });

  try {
    try {
      await migrate(setupDb, { migrationsFolder: "./drizzle" });
    } catch {
      throw new SetupInputError(
        "Das Datenbankschema konnte nicht angelegt werden. Bitte Datenbankrechte und Serverversion prüfen.",
      );
    }

    const [existingOwner] = await setupDb
      .select({ id: users.id })
      .from(users)
      .where(eq(users.platformRole, "platform_owner"))
      .limit(1);
    if (existingOwner) {
      await persistInstallation(databaseUrl);
      return { status: "already_installed" as const };
    }

    const [existingEmail] = await setupDb
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
    const legalProfile = createInitialLegalProfile(
      { ...parsed, ownerName: parsed.ownerName, email: parsed.email },
      { regulatedActivity: false },
    );
    await setupDb.transaction(async (tx) => {
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
      await tx.insert(legalProfiles).values({
        profileKey: "platform",
        scope: "platform",
        data: legalProfile.data,
        modules: legalProfile.modules,
        updatedByUserId: ownerId,
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

    await persistInstallation(databaseUrl);
    return { status: "installed" as const };
  } finally {
    await connection.end();
  }
}
