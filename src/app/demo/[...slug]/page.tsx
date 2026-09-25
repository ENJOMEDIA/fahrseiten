import { notFound } from "next/navigation";

import { demoWebsite, findDemoPage } from "@/modules/cms/demo-content";
import { DemoSite } from "@/modules/cms/demo-site";

export default async function TenantDemoSubpage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const page = findDemoPage(slug.join("/"));
  if (!page) notFound();
  return <DemoSite page={page} website={demoWebsite} />;
}
