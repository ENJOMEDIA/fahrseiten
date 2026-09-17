import "server-only";

import { db } from "@/db/client";
import { platformSettings } from "@/db/schema";

export async function findPlatformSettings() {
  try {
    const [settings] = await db.select().from(platformSettings).limit(1);
    return settings ?? null;
  } catch {
    return null;
  }
}
