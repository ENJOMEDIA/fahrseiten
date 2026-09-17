import { requirePlatformPermission } from "@/modules/platform/access";
import { salesCsvTemplate } from "@/modules/platform/sales-csv";

export async function GET() {
  await requirePlatformPermission("platform.sales.manage");
  return new Response(`\uFEFF${salesCsvTemplate()}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="fahrseiten-akquise-vorlage.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
