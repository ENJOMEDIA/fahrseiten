import { notFound } from "next/navigation";

import { demoWebsite, findDemoPage } from "@/modules/cms/demo-content";
import { DemoSite } from "@/modules/cms/demo-site";

export default function TenantDemoPage() {
  const page = findDemoPage("");
  if (!page) notFound();
  return <DemoSite page={page} website={demoWebsite} />;
}
