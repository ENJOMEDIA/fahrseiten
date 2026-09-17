import { Breadcrumbs } from "@/components/layout/app-shell";
export function CustomerPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Kundenbereich", href: "/kunde" }, { label: title }]}
      />
      <div className="reveal-up">
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
      </div>
      <div className="reveal-up animation-delay-1 mt-8">{children}</div>
    </>
  );
}
