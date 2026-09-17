import type { Metadata } from "next";
import { ConsentManager } from "@/modules/consent/consent-manager";
import { getOptionalServiceConfig } from "@/modules/consent/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fahrseiten.de"),
  title: { default: "FahrSeiten – by ENJO MEDIA", template: "%s · FahrSeiten" },
  description: "Websites und digitale Werkzeuge für moderne Fahrschulen.",
  icons: {
    icon: [{ url: "/api/favicon?v=2", sizes: "any" }],
    shortcut: "/api/favicon?v=2",
  },
  openGraph: {
    title: "FahrSeiten – by ENJO MEDIA",
    description: "Die mandantenfähige Website-Plattform für Fahrschulen.",
    type: "website",
    locale: "de_DE",
    siteName: "FahrSeiten",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <ConsentManager optionalServices={getOptionalServiceConfig()} />
      </body>
    </html>
  );
}
