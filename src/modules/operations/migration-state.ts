import type { MigrationMeta } from "drizzle-orm/migrator";

export type AppliedMigration = {
  hash: string;
  createdAt: number;
};

export type ComparedMigrationState = {
  status: "ready" | "pending" | "error";
  detail: string;
};

export function compareMigrationState(
  available: MigrationMeta[],
  applied: AppliedMigration | null,
): ComparedMigrationState {
  if (available.length === 0)
    return {
      status: "error",
      detail: "Im Release wurden keine Datenbankmigrationen gefunden.",
    };

  const latest = available.at(-1)!;
  if (!applied) {
    return {
      status: "pending",
      detail: `${available.length} Datenbankmigrationen sind noch nicht angewendet.`,
    };
  }

  const pending = available.filter(
    (migration) => migration.folderMillis > applied.createdAt,
  );
  if (pending.length > 0) {
    return {
      status: "pending",
      detail: `${pending.length} neue Datenbankmigration${pending.length === 1 ? " ist" : "en sind"} verfügbar.`,
    };
  }

  if (applied.createdAt > latest.folderMillis) {
    return {
      status: "error",
      detail:
        "Die Datenbank enthält eine neuere Migration als dieser Softwarestand.",
    };
  }

  if (applied.hash !== latest.hash) {
    return {
      status: "error",
      detail:
        "Die zuletzt angewendete Migration stimmt nicht mit dem Release überein.",
    };
  }

  return {
    status: "ready",
    detail: `Alle ${available.length} Datenbankmigrationen sind angewendet.`,
  };
}
