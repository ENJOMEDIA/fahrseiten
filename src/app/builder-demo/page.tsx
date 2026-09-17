import { notFound } from "next/navigation";
import { BuilderDemo } from "@/modules/builder/builder-demo";
export default function LocalBuilderDemoPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <BuilderDemo />;
}
