import Image from "next/image";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantLogoId, listTenantMedia } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";
import { chooseTenantLogo, uploadTenantMedia } from "./actions";

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
  const [assets, logoId] = context
    ? await Promise.all([
        listTenantMedia(context.tenantId),
        findTenantLogoId(context.tenantId),
      ])
    : [[], null];

  return (
    <CustomerPage
      title="Medien & Logo"
      description="Bilder einmal hochladen und sicher in Website, Baukasten und Logo verwenden."
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
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {assets.map((asset) => (
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
                      {logoId === asset.id ? (
                        <StatusBadge tone="success">Logo</StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {asset.width} × {asset.height} px ·{" "}
                      {Math.ceil(asset.byteSize / 1024)} KB
                    </p>
                    {logoId !== asset.id ? (
                      <form action={chooseTenantLogo} className="mt-3">
                        <input name="mediaId" type="hidden" value={asset.id} />
                        <button
                          className="text-sm font-semibold text-cyan-800"
                          type="submit"
                        >
                          Als Logo verwenden
                        </button>
                      </form>
                    ) : null}
                  </div>
                </Card>
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
                accept="image/png,image/jpeg,image/webp"
                className="mt-2 block w-full text-sm"
                name="file"
                required
                type="file"
              />
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
            <label className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <input name="useAsLogo" type="checkbox" />
              <span>Direkt als Website-Logo verwenden</span>
            </label>
            <button
              className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              type="submit"
            >
              Prüfen und hochladen
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            PNG, JPEG oder WebP · maximal 8 MB. Dateien liegen persistent
            außerhalb des Git-Verzeichnisses.
          </p>
        </Card>
      </div>
    </CustomerPage>
  );
}
