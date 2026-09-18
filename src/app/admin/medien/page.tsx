import Image from "next/image";
import { CustomerPage } from "@/components/customer/customer-page";
import { MediaCategoryOverview } from "@/components/media/media-category-overview";
import { Card } from "@/components/ui/card";
import { listPlatformMedia } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import {
  mediaCategoryLabels,
  platformMediaCategoryValues,
} from "@/modules/media/service";
import { requirePlatformPermission } from "@/modules/platform/access";
import { categorizePlatformMedia, uploadPlatformMedia } from "./actions";
import { PlatformCropForm } from "./platform-crop-form";

export default async function PlatformMediaPage() {
  await requirePlatformPermission("platform.security.manage");
  const assets = await listPlatformMedia();
  const groups = platformMediaCategoryValues.map((category) => ({
    category,
    assets: assets.filter((asset) => asset.category === category),
  }));
  const categoryCounts = Object.fromEntries(
    groups.map((group) => [group.category, group.assets.length]),
  );
  return (
    <CustomerPage
      title="Plattform-Medien"
      description="Bilder der FahrSeiten-Landingpage zentral verwalten, zuschneiden und als WebP optimieren."
    >
      <MediaCategoryOverview
        categories={platformMediaCategoryValues}
        counts={categoryCounts}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_19rem]">
        <div className="space-y-9">
          {groups.map((group) => (
            <section id={`media-${group.category}`} key={group.category}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {mediaCategoryLabels[group.category]}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {group.assets.length
                      ? `${group.assets.length} gespeicherte Medien`
                      : "Noch keine Medien in diesem Bereich"}
                  </p>
                </div>
              </div>
              {group.assets.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {group.assets.map((asset) => (
                    <Card className="overflow-hidden p-0" key={asset.id}>
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <Image
                          alt={asset.altText}
                          className="object-contain"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
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
                        <form
                          action={categorizePlatformMedia}
                          className="mt-4 flex gap-2"
                        >
                          <input
                            name="mediaId"
                            type="hidden"
                            value={asset.id}
                          />
                          <label className="min-w-0 flex-1 text-xs font-semibold text-slate-600">
                            Bereich
                            <select
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 font-normal"
                              defaultValue={asset.category}
                              name="category"
                            >
                              {platformMediaCategoryValues.map((category) => (
                                <option key={category} value={category}>
                                  {mediaCategoryLabels[category]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            className="self-end rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                            type="submit"
                          >
                            Verschieben
                          </button>
                        </form>
                        {!["image/svg+xml", "image/x-icon"].includes(
                          asset.mimeType,
                        ) ? (
                          <PlatformCropForm
                            imageUrl={mediaPublicUrl(asset.id)}
                            mediaId={asset.id}
                          />
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500">
                  Beim nächsten Upload kannst du diesen Bereich direkt
                  auswählen.
                </div>
              )}
            </section>
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
            <label className="block text-sm font-semibold">
              Landingpage-Bereich
              <select
                className="mt-2 w-full rounded-xl border p-3 font-normal"
                defaultValue="marketing_sections"
                name="category"
              >
                {platformMediaCategoryValues.map((category) => (
                  <option key={category} value={category}>
                    {mediaCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
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
