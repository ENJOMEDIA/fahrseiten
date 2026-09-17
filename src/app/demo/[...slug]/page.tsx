import { notFound } from "next/navigation";

import { demoWebsite, findDemoPage } from "@/modules/cms/demo-content";
import { TenantSite } from "@/modules/cms/tenant-site";
import { DemoContactForm } from "@/modules/contacts/contact-form";

export default async function TenantDemoSubpage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const page = findDemoPage(slug.join("/"));
  if (!page) notFound();
  return (
    <TenantSite
      afterContent={page.slug === "kontakt" ? <DemoContactForm /> : null}
      page={page}
      website={demoWebsite}
    />
  );
}
