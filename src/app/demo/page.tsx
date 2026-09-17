import { notFound } from "next/navigation";

import { demoWebsite, findDemoPage } from "@/modules/cms/demo-content";
import { TenantSite } from "@/modules/cms/tenant-site";

export default function TenantDemoPage() {
  const page = findDemoPage("");
  if (!page) notFound();
  return <TenantSite page={page} website={demoWebsite} />;
}
