import { notFound } from "next/navigation";

import { findPublicMedia } from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = await findPublicMedia(id);
  if (!asset) notFound();
  const optimized =
    asset.processingStatus === "ready" && asset.optimizedStorageKey;
  const bytes = await getMediaStorage().read(
    optimized ? asset.optimizedStorageKey! : asset.storageKey,
  );
  return new Response(bytes, {
    headers: {
      "Content-Type": optimized ? "image/webp" : asset.mimeType,
      "Content-Length": String(
        optimized ? asset.optimizedByteSize : asset.byteSize,
      ),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
