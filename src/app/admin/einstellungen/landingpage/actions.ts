"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { platformSettings } from "@/db/schema";
import { requirePlatformPermission } from "@/modules/platform/access";

const schema = z.object({
  brandName: z.string().trim().min(2).max(160),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function saveLandingpageSettings(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  const input = schema.parse(Object.fromEntries(formData));
  await db.update(platformSettings).set(input);
  revalidatePath("/", "layout");
  revalidatePath("/admin/einstellungen/landingpage");
}
