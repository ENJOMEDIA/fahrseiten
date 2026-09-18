import Image from "next/image";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  findTenantBrandingIds,
  listTenantMedia,
} from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import {
  mediaCategoryLabels,
  mediaCategoryValues,
} from "@/modules/media/service";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";
import {
  chooseTenantFavicon,
  chooseTenantLogo,
  uploadTenantMedia,
} from "./actions";
import { MediaCropForm } from "./media-crop-form";

export default async function MediaPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  const context =
    identity && membership
      ? createMembershipTenantContext({
          requestedTenantId: membership.tenantId,
          userId: identity.id,
          activeTenantIds: identity.memberships.map((item) => item.tenantId),
        })
      : null;
  const [assets, branding] = context
    ? await Promise.all([
        listTenantMedia(context.tenantId),
        findTenantBrandingIds(context.tenantId),
      ])
    : [[], { logoMediaId: null, faviconMediaId: null }];
  const populatedCategories = mediaCategoryValues
    .map((category) => ({
      category,
      assets: assets.filter((asset) => asset.category === category),
    }))
    .filter((group) => group.assets.length > 0);

  return (
    <CustomerPage
      title="Medien & Markenauftritt"
      description="Bilder verwalten und Seitenlogo sowie Browser-Favicon getrennt festlegen."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_23rem]">
        <div>
          {assets.length === 0 ? (
            <Card className="py-14 text-center">
              <h2 className="text-xl font-semibold">
                Deine Medienbibliothek ist bereit
              </h2>
              <p className="mt-2 text-slate-600">
                Lade rechts das erste Bild oder Logo hoch.
              </p>
            </Card>
          ) : (
            <div className="space-y-9">
              {populatedCategories.map((group) => (
                <section key={group.category}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                      {mediaCategoryLabels[group.category]}
                    </h2>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {group.assets.length} Medien
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {group.assets.map((asset) => (
                      <Card className="overflow-hidden p-0" key={asset.id}>
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image
                            alt={asset.altText}
                            className="object-contain p-4"
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            src={mediaPublicUrl(asset.id)}
                            unoptimized
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold">
                              {asset.originalName}
                            </p>
                            {branding.logoMediaId === asset.id ? (
                              <StatusBadge tone="success">Logo</StatusBadge>
                            ) : null}
                            {branding.faviconMediaId === asset.id ? (
                              <StatusBadge tone="info">Favicon</StatusBadge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {asset.width} × {asset.height} px ·{" "}
                            {Math.ceil(asset.byteSize / 1024)} KB
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Optimierung:{" "}
                            {asset.processingStatus === "ready"
                              ? "WebP bereit"
                              : asset.processingStatus === "failed"
                                ? "Fehlgeschlagen"
                                : asset.processingStatus === "queued" ||
                                    asset.processingStatus === "processing"
                                  ? "Wird verarbeitet"
                                  : "Original"}
                          </p>
                          {branding.logoMediaId !== asset.id ? (
                            <form action={chooseTenantLogo} className="mt-3">
                              <input
                                name="mediaId"
                                type="hidden"
                                value={asset.id}
                              />
                              <button
                                className="text-sm font-semibold text-cyan-800"
                                type="submit"
                              >
                                Als Logo verwenden
                              </button>
                            </form>
                          ) : null}
                          <MediaCropForm
                            imageUrl={mediaPublicUrl(asset.id)}
                            mediaId={asset.id}
                            processable={
                              !["image/svg+xml", "image/x-icon"].includes(
                                asset.mimeType,
                              )
                            }
                          />
                          {branding.faviconMediaId !== asset.id ? (
                            <form action={chooseTenantFavicon} className="mt-2">
                              <input
                                name="mediaId"
                                type="hidden"
                                value={asset.id}
                              />
                              <button
                                className="text-sm font-semibold text-indigo-700"
                                type="submit"
                              >
                                Als Favicon verwenden
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
        <Card className="h-fit xl:sticky xl:top-28">
          <h2 className="font-semibold">Bild hochladen</h2>
          <form action={uploadTenantMedia} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Bilddatei
              <input
                accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/png,image/jpeg,image/webp"
                className="mt-2 block w-full text-sm"
                name="file"
                required
                type="file"
              />
            </label>
            <label className="block text-sm font-semibold">
              Bereich
              <select
                className="mt-2 w-full rounded-xl border p-3 font-normal"
                defaultValue="general"
                name="category"
              >
                {mediaCategoryValues.map((category) => (
                  <option key={category} value={category}>
                    {mediaCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Bildbeschreibung
              <input
                className="mt-2 w-full rounded-xl border p-3"
                maxLength={300}
                name="altText"
                placeholder="z. B. Logo der Fahrschule"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Verwendung
              <select
                className="mt-2 w-full rounded-xl border p-3 font-normal"
                defaultValue="library"
                name="usage"
              >
                <option value="library">
                  Nur in Medienbibliothek speichern
                </option>
                <option value="logo">Als Seitenlogo verwenden</option>
                <option value="favicon">Als Favicon verwenden</option>
              </select>
            </label>
            <button
              className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              type="submit"
            >
              Prüfen und hochladen
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            ICO, SVG, PNG, JPEG oder WebP · maximal 8 MB. Dateien liegen
            persistent außerhalb des Git-Verzeichnisses.
          </p>
        </Card>
      </div>
    </CustomerPage>
  );
}
