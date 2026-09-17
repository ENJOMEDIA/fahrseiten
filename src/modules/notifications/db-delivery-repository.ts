import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notificationDeliveries } from "@/db/schema";
import { createId } from "@/lib/ids";
import type { DeliveryRepository } from "./delivery";

export const dbDeliveryRepository: DeliveryRepository = {
  async reserve(input) {
    const existing = await db
      .select({
        id: notificationDeliveries.id,
        status: notificationDeliveries.status,
      })
      .from(notificationDeliveries)
      .where(eq(notificationDeliveries.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing[0]?.status === "failed") {
      await db
        .update(notificationDeliveries)
        .set({ status: "reserved", errorCode: null })
        .where(eq(notificationDeliveries.id, existing[0].id));
      return true;
    }
    if (existing.length) return false;
    try {
      await db.insert(notificationDeliveries).values({
        id: createId(),
        ...input,
        channel: "email",
        status: "reserved",
      });
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
  async markSent(idempotencyKey, sentAt) {
    await db
      .update(notificationDeliveries)
      .set({ status: "sent", sentAt, errorCode: null })
      .where(eq(notificationDeliveries.idempotencyKey, idempotencyKey));
  },
  async markFailed(idempotencyKey, errorCode) {
    await db
      .update(notificationDeliveries)
      .set({ status: "failed", errorCode })
      .where(eq(notificationDeliveries.idempotencyKey, idempotencyKey));
  },
};
