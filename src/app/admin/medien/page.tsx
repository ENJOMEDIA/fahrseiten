import Image from "next/image";
import { CustomerPage } from "@/components/customer/customer-page";
import { Card } from "@/components/ui/card";
import { listPlatformMedia } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { requirePlatformPermission } from "@/modules/platform/access";
import { uploadPlatformMedia } from "./actions";
import { PlatformCropForm } from "./platform-crop-form";

export default async function PlatformMediaPage() {
  await requirePlatformPermission("platform.security.manage");
  const assets = await listPlatformMedia();
  return (
    <CustomerPage
      title="Plattform-Medien"
      description="Bilder der FahrSeiten-Landingpage zentral verwalten, zuschneiden und als WebP optimieren."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_23rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Card className="overflow-hidden p-0" key={asset.id}>
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image
                  alt={asset.altText}
                  className="object-contain"
                  fill
                  sizes="50vw"
                  src={mediaPublicUrl(asset.id)}
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="font-semibold">{asset.originalName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {asset.processingStatus === "ready"
                    ? `WebP · ${Math.ceil((asset.optimizedByteSize ?? 0) / 1024)} KB`
                    : asset.processingStatus}
                </p>
                {!["image/svg+xml", "image/x-icon"].includes(asset.mimeType) ? (
                  <PlatformCropForm
                    imageUrl={mediaPublicUrl(asset.id)}
                    mediaId={asset.id}
                  />
                ) : null}
              </div>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <h2 className="font-semibold">Landingpage-Bild hochladen</h2>
          <form action={uploadPlatformMedia} className="mt-4 space-y-4">
            <input
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              name="file"
              required
              type="file"
            />
            <input
              className="w-full rounded-xl border p-3"
              name="altText"
              placeholder="Bildbeschreibung"
              required
            />
            <textarea
              className="w-full rounded-xl border p-3"
              name="description"
              placeholder="Interne Notiz"
            />
            <button className="w-full rounded-xl bg-cyan-600 p-3 font-semibold text-white">
              Hochladen & optimieren
            </button>
          </form>
        </Card>
      </div>
    </CustomerPage>
  );
}
