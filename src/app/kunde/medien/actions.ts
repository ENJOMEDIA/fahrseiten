"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  databaseMediaRepository,
  setTenantFavicon,
  setTenantLogo,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { uploadImage } from "@/modules/media/service";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

async function requireWritableTenant() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (
    !identity ||
    !membership ||
    !hasTenantPermission(membership.role, "tenant.content.write")
  )
    redirect("/login");
  return createMembershipTenantContext({
    requestedTenantId: membership.tenantId,
    userId: identity.id,
    activeTenantIds: identity.memberships.map((item) => item.tenantId),
  });
}

export async function uploadTenantMedia(formData: FormData) {
  const context = await requireWritableTenant();
  const file = formData.get("file");
  if (!(file instanceof File))
    throw new Error("Bitte eine Bilddatei auswählen.");
  const asset = await uploadImage({
    tenantId: context.tenantId,
    bytes: new Uint8Array(await file.arrayBuffer()),
    metadata: {
      originalName: file.name,
      claimedMimeType: file.type,
      altText: String(formData.get("altText") ?? ""),
      description: String(formData.get("description") ?? ""),
    },
    storage: getMediaStorage(),
    repository: databaseMediaRepository,
  });
  const usage = String(formData.get("usage") ?? "library");
  if (usage === "logo") await setTenantLogo(context.tenantId, asset.id);
  if (usage === "favicon") await setTenantFavicon(context.tenantId, asset.id);
  revalidatePath("/kunde/medien");
}

export async function chooseTenantLogo(formData: FormData) {
  const context = await requireWritableTenant();
  await setTenantLogo(context.tenantId, String(formData.get("mediaId") ?? ""));
  revalidatePath("/kunde/medien");
}

export async function chooseTenantFavicon(formData: FormData) {
  const context = await requireWritableTenant();
  await setTenantFavicon(
    context.tenantId,
    String(formData.get("mediaId") ?? ""),
  );
  revalidatePath("/kunde/medien");
  revalidatePath("/api/favicon");
}
