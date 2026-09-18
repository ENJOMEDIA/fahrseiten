import { notFound } from "next/navigation";

import { demoWebsite, findDemoPage } from "@/modules/cms/demo-content";
import { DemoSite } from "@/modules/cms/demo-site";
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
    <DemoSite
      afterContent={page.slug === "kontakt" ? <DemoContactForm /> : null}
      page={page}
      website={demoWebsite}
    />
  );
}
