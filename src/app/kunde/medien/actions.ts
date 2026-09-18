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
import { queueMediaOptimization } from "@/modules/media/processing";
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
  const usage = String(formData.get("usage") ?? "library");
  const asset = await uploadImage({
    tenantId: context.tenantId,
    bytes: new Uint8Array(await file.arrayBuffer()),
    metadata: {
      originalName: file.name,
      claimedMimeType: file.type,
      altText: String(formData.get("altText") ?? ""),
      description: String(formData.get("description") ?? ""),
      category:
        usage === "logo" || usage === "favicon"
          ? "branding"
          : String(formData.get("category") ?? "general"),
    },
    storage: getMediaStorage(),
    repository: databaseMediaRepository,
  });
  if (usage === "logo") await setTenantLogo(context.tenantId, asset.id);
  if (usage === "favicon") await setTenantFavicon(context.tenantId, asset.id);
  if (!["image/svg+xml", "image/x-icon"].includes(asset.mimeType))
    await queueMediaOptimization({
      tenantId: context.tenantId,
      mediaId: asset.id,
      cropAspect: "original",
      cropX: 50,
      cropY: 50,
      cropZoom: 100,
    });
  revalidatePath("/kunde/medien");
  revalidatePath("/kunde/website/builder");
}

export async function cropTenantMedia(formData: FormData) {
  const context = await requireWritableTenant();
  await queueMediaOptimization({
    tenantId: context.tenantId,
    mediaId: String(formData.get("mediaId")),
    cropAspect: String(formData.get("cropAspect")) as "original",
    cropX: formData.get("cropX"),
    cropY: formData.get("cropY"),
    cropZoom: formData.get("cropZoom"),
  });
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
