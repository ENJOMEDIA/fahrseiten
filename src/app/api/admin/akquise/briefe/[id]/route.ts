import { getMediaStorage } from "@/modules/media/runtime-storage";
import { findPostalDispatchForDownload } from "@/modules/onlinebrief/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requirePlatformPermission("platform.sales.manage");
  const { id } = await params;
  const dispatch = await findPostalDispatchForDownload(id);
  if (!dispatch)
    return Response.json({ error: "Brief nicht gefunden." }, { status: 404 });
  const bytes = await getMediaStorage().read(dispatch.storageKey);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${dispatch.originalName}"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
