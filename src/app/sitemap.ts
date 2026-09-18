import type { MetadataRoute } from "next";
const paths = [
  "",
  "/funktionen",
  "/design",
  "/preise",
  "/faq",
  "/kontakt",
  "/login",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/cookie-einstellungen",
  "/fehler-melden",
];
export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `https://fahrseiten.de${path}`,
    lastModified: new Date("2026-09-17"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
