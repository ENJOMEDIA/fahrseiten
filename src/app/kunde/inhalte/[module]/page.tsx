import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { contentModules } from "@/modules/customer/navigation";
import { ModuleEditor } from "@/modules/customer/module-editor";
export default async function ContentModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleConfig = contentModules[slug as keyof typeof contentModules];
  if (!moduleConfig) notFound();
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Inhalte", href: "/kunde/inhalte" },
          { label: moduleConfig.title },
        ]}
      />
      <h1 className="mt-6 text-3xl font-semibold">{moduleConfig.title}</h1>
      <p className="mt-3 text-slate-600">
        Alle Angaben sind lokale, fiktive Demo-Inhalte.
      </p>
      <ModuleEditor
        example={moduleConfig.example}
        singular={moduleConfig.singular}
      />
    </>
  );
}
