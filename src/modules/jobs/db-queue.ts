import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { backgroundJobs } from "@/db/schema";
import type { JobQueueRepository } from "./queue";
export const dbJobQueue: JobQueueRepository = {
  async enqueue(input) {
    const existing = await db
      .select({ id: backgroundJobs.id })
      .from(backgroundJobs)
      .where(eq(backgroundJobs.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing.length) return false;
    try {
      await db.insert(backgroundJobs).values(input);
      return true;
    } catch (error) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY"
      )
        return false;
      throw error;
    }
  },
};
