"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  createTenantContentEntry,
  deleteTenantContentEntry,
  setTenantContentEntryActive,
  type ContentModuleKey,
  updateTenantContentEntry,
} from "@/modules/content/management";
import { contentModules } from "@/modules/customer/navigation";
import { databaseMediaRepository } from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { uploadImage } from "@/modules/media/service";
import { queueMediaOptimization } from "@/modules/media/processing";
import {
  assertTenantFeature,
  isTenantFeatureEnabled,
} from "@/modules/features/access";
import { canCreateLocation } from "@/modules/features/service";
import { listTenantContentEntries } from "@/modules/content/management";

export type ContentActionState = { message: string; error: boolean };

async function writableMembership() {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (
    !membership ||
    !hasTenantPermission(membership.role, "tenant.content.write")
  )
    notFound();
  return membership;
}

function checkedModule(value: FormDataEntryValue | null) {
  const contentModule = String(value) as ContentModuleKey;
  if (!(contentModule in contentModules))
    throw new Error("Inhaltsbereich ist ungültig.");
  return contentModule;
}

async function prepareEntryImage(
  tenantId: string,
  contentModule: ContentModuleKey,
  formData: FormData,
) {
  if (!(["fahrzeuge", "team"] as ContentModuleKey[]).includes(contentModule))
    return;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const title = String(formData.get("title") ?? "").trim();
    const team = contentModule === "team";
    const asset = await uploadImage({
      tenantId,
      bytes: new Uint8Array(await file.arrayBuffer()),
      metadata: {
        originalName: file.name,
        claimedMimeType: file.type,
        altText:
          String(formData.get("imageAlt") ?? "").trim() ||
          (team ? `Teamfoto ${title}` : `Fahrschulfahrzeug ${title}`),
        category: team ? "team" : "vehicles",
      },
      storage: getMediaStorage(),
      repository: databaseMediaRepository,
    });
    formData.set("imageMediaId", asset.id);
    if (asset.mimeType !== "image/svg+xml")
      await queueMediaOptimization({
        tenantId,
        mediaId: asset.id,
        cropAspect: "4:3",
        cropX: 50,
        cropY: 50,
        cropZoom: 100,
      });
    return;
  }
  const mediaId = String(formData.get("imageMediaId") ?? "");
  if (mediaId) {
    const asset = await databaseMediaRepository.find(tenantId, mediaId);
    if (!asset) throw new Error("Das ausgewählte Bild wurde nicht gefunden.");
  }
}

export async function createContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await assertTenantFeature(membership.tenantId, "content_modules");
    if (contentModule === "standorte") {
      const locations = await listTenantContentEntries(
        membership.tenantId,
        "standorte",
      );
      const multiLocation = await isTenantFeatureEnabled(
        membership.tenantId,
        "multi_location",
      );
      if (!canCreateLocation(locations.length, multiLocation))
        throw new Error(
          "Ein Hauptstandort ist enthalten. Weitere Standorte benötigen das Modul „Mehrere Standorte“.",
        );
    }
    await prepareEntryImage(membership.tenantId, contentModule, formData);
    await createTenantContentEntry({
      tenantId: membership.tenantId,
      module: contentModule,
      formData,
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    revalidatePath("/kunde/einrichtung");
    revalidatePath("/site", "layout");
    return { message: "Eintrag wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Eintrag konnte nicht gespeichert werden.",
      error: true,
    };
  }
}

export async function updateContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await assertTenantFeature(membership.tenantId, "content_modules");
    await prepareEntryImage(membership.tenantId, contentModule, formData);
    await updateTenantContentEntry({
      tenantId: membership.tenantId,
      module: contentModule,
      id: String(formData.get("id")),
      formData,
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    revalidatePath("/kunde/einrichtung");
    revalidatePath("/site", "layout");
    return { message: "Änderungen wurden gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Änderungen konnten nicht gespeichert werden.",
      error: true,
    };
  }
}

export async function deleteContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await assertTenantFeature(membership.tenantId, "content_modules");
    await deleteTenantContentEntry({
      tenantId: membership.tenantId,
      module: contentModule,
      id: String(formData.get("id")),
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    revalidatePath("/kunde/einrichtung");
    revalidatePath("/site", "layout");
    return { message: "Eintrag wurde gelöscht.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Eintrag konnte nicht gelöscht werden.",
      error: true,
    };
  }
}

export async function toggleContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await assertTenantFeature(membership.tenantId, "content_modules");
    await setTenantContentEntryActive({
      tenantId: membership.tenantId,
      module: contentModule,
      id: String(formData.get("id")),
      active: formData.get("active") === "true",
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    revalidatePath("/kunde/einrichtung");
    revalidatePath("/site", "layout");
    return { message: "Sichtbarkeit wurde geändert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Änderung konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
