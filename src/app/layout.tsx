import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_Thai, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { SITE_URL } from "@/lib/site-config";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Z2Zs Lab", template: "%s — Z2Zs Lab" },
  description: "Independent technology reporting, experiments, and verifiable analysis from Bangkok.",
  applicationName: "Z2Zs Lab",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "64x64" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-locale") === "en" ? "en" : "th";
  return (
    <html lang={locale} className={`${thai.variable} ${space.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
