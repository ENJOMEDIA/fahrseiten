import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditLogs,
  passwordResetTokens,
  sessions,
  tenantMemberships,
  users,
} from "@/db/schema";
import { createId } from "@/lib/ids";

import type { PlatformRole, TenantRole } from "./permissions";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string | null;
  platformRole: PlatformRole | null;
  active: boolean;
};

export type SessionIdentity = Omit<AuthUser, "passwordHash"> & {
  memberships: ReadonlyArray<{ tenantId: string; role: TenantRole }>;
};

export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      passwordHash: users.passwordHash,
      platformRole: users.platformRole,
      active: users.active,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user ?? null;
}

export async function createDatabaseSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  await db
    .insert(sessions)
    .values({ id: createId(), userId, tokenHash, expiresAt });
}

export async function findSessionIdentity(
  tokenHash: string,
): Promise<SessionIdentity | null> {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      platformRole: users.platformRole,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!result?.active) return null;

  const memberships = await db
    .select({
      tenantId: tenantMemberships.tenantId,
      role: tenantMemberships.role,
    })
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.userId, result.id),
        eq(tenantMemberships.active, true),
      ),
    );

  return { ...result, memberships };
}

export async function deleteDatabaseSession(tokenHash: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  await db
    .insert(passwordResetTokens)
    .values({ id: createId(), userId, tokenHash, expiresAt });
}

export async function consumePasswordResetToken(
  tokenHash: string,
  passwordHash: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [reset] = await tx
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!reset) return false;

    await tx
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, reset.userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, reset.id));
    await tx.delete(sessions).where(eq(sessions.userId, reset.userId));
    return true;
  });
}

export async function writeAuthAuditEvent(input: {
  actorUserId?: string;
  action: "auth.login" | "auth.logout" | "auth.password_reset_completed";
}): Promise<void> {
  await db.insert(auditLogs).values({
    id: createId(),
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: "authentication",
  });
}
