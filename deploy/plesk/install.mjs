import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

import { hashInstallerPassword } from "./password.mjs";
import { resolveDatabaseUrl } from "./runtime-config.mjs";

export function validateBootstrapInput(source) {
  const email = source.INSTALL_OWNER_EMAIL?.trim().toLowerCase() ?? "";
  const displayName = source.INSTALL_OWNER_NAME?.trim() ?? "";
  const password = source.INSTALL_OWNER_PASSWORD ?? "";
  const errors = [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.push("INSTALL_OWNER_EMAIL muss eine gültige E-Mail-Adresse sein.");
  }
  if (displayName.length < 2 || displayName.length > 160) {
    errors.push("INSTALL_OWNER_NAME muss 2 bis 160 Zeichen lang sein.");
  }
  if (password.length < 12 || password.length > 200) {
    errors.push("INSTALL_OWNER_PASSWORD muss 12 bis 200 Zeichen lang sein.");
  }

  return { email, displayName, password, errors };
}

export async function installPlatform(source = process.env) {
  const databaseUrl = resolveDatabaseUrl(source);
  if (!databaseUrl) throw new Error("DATABASE_URL fehlt.");

  const parsedDatabaseUrl = new URL(databaseUrl);
  if (parsedDatabaseUrl.protocol !== "mysql:") {
    throw new Error("DATABASE_URL muss das mysql-Protokoll verwenden.");
  }

  const connection = await mysql.createConnection(databaseUrl);
  try {
    await migrate(drizzle({ client: connection }), {
      migrationsFolder: "./drizzle",
    });

    const [ownerRows] = await connection.execute(
      "SELECT COUNT(*) AS owner_count FROM users WHERE platform_role = 'platform_owner' AND active = true",
    );
    const ownerCount = Number(ownerRows[0]?.owner_count ?? 0);
    if (ownerCount > 0) {
      console.info(
        "Schema ist aktuell; ein aktiver platform_owner ist bereits vorhanden.",
      );
      return { createdOwner: false };
    }

    const input = validateBootstrapInput(source);
    if (input.errors.length > 0) {
      throw new Error(input.errors.join(" "));
    }

    const [existingRows] = await connection.execute(
      "SELECT id, platform_role FROM users WHERE email = ? LIMIT 1",
      [input.email],
    );
    if (existingRows.length > 0) {
      throw new Error(
        "Die Eigentümer-E-Mail gehört bereits zu einem Benutzer. Der Installer erhöht vorhandene Rechte nicht automatisch.",
      );
    }

    const ownerId = randomUUID();
    const passwordHash = await hashInstallerPassword(input.password);
    await connection.beginTransaction();
    try {
      await connection.execute(
        "INSERT INTO users (id, email, display_name, password_hash, platform_role, active) VALUES (?, ?, ?, ?, 'platform_owner', true)",
        [ownerId, input.email, input.displayName, passwordHash],
      );
      await connection.execute(
        "INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, 'platform.install.owner_created', 'user', ?, ?)",
        [
          randomUUID(),
          ownerId,
          ownerId,
          JSON.stringify({ source: "plesk_installer" }),
        ],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    console.info(
      "Schema ist aktuell; der erste platform_owner wurde erfolgreich angelegt.",
    );
    return { createdOwner: true };
  } finally {
    await connection.end();
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;
if (invokedPath === import.meta.url) {
  installPlatform().catch((error) => {
    console.error(
      "Die FahrSeiten-Installation ist fehlgeschlagen:",
      error instanceof Error ? error.message : "Unbekannter Fehler",
    );
    process.exit(1);
  });
}
