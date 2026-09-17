"use server";

import { revalidatePath } from "next/cache";

import { runDatabaseMigrations } from "@/modules/operations/migration-status";
import { requirePlatformPermission } from "@/modules/platform/access";

export type MigrationActionState = { message: string; error: boolean };

export async function runMigrationsAction(
  _state: MigrationActionState,
): Promise<MigrationActionState> {
  void _state;
  await requirePlatformPermission("platform.security.manage");
  const status = await runDatabaseMigrations();
  revalidatePath("/admin/system");
  return { message: status.detail, error: status.status === "error" };
}
