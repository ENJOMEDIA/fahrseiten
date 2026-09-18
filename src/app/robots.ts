import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/funktionen", "/design", "/preise", "/faq", "/kontakt"],
        disallow: [
          "/admin",
          "/kunde",
          "/api",
          "/builder-demo",
          "/demo",
          "/brief",
        ],
      },
    ],
    sitemap: "https://fahrseiten.de/sitemap.xml",
  };
}
