import "server-only";
import { and, asc, eq, inArray, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { backgroundJobs } from "@/db/schema";
import type { JobRecord, JobRepository } from "./runner";

export const dbJobRepository: JobRepository = {
  async claimDue(now, limit) {
    return db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(backgroundJobs)
        .where(
          and(
            inArray(backgroundJobs.status, ["pending", "retry"]),
            lte(backgroundJobs.runAt, now),
          ),
        )
        .orderBy(asc(backgroundJobs.runAt))
        .limit(limit)
        .for("update", { skipLocked: true });
      for (const row of rows)
        await tx
          .update(backgroundJobs)
          .set({ status: "running", lockedAt: now })
          .where(
            and(
              eq(backgroundJobs.id, row.id),
              inArray(backgroundJobs.status, ["pending", "retry"]),
            ),
          );
      return rows.map((row): JobRecord => ({
        id: row.id,
        tenantId: row.tenantId,
        type: row.type,
        idempotencyKey: row.idempotencyKey,
        payload: row.payload,
        attempts: row.attempts,
        maxAttempts: row.maxAttempts,
      }));
    });
  },
  async complete(id, now) {
    await db
      .update(backgroundJobs)
      .set({ status: "completed", completedAt: now, lockedAt: null })
      .where(eq(backgroundJobs.id, id));
  },
  async retry(id, attempts, runAt, errorCode) {
    await db
      .update(backgroundJobs)
      .set({
        status: "retry",
        attempts,
        runAt,
        lastErrorCode: errorCode,
        lockedAt: null,
      })
      .where(eq(backgroundJobs.id, id));
  },
  async fail(id, attempts, errorCode) {
    await db
      .update(backgroundJobs)
      .set({
        status: "failed",
        attempts,
        lastErrorCode: errorCode,
        lockedAt: null,
      })
      .where(eq(backgroundJobs.id, id));
  },
};
