import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_Thai, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { SITE_URL } from "@/lib/site-config";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  display: "optional",
  preload: false,
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "optional",
  preload: false,
});

const themeInit = `try{const saved=localStorage.getItem("z2zs:theme");const theme=saved==="light"?"light":"dark";document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark"}`;

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
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-locale") === "en" ? "en" : "th";
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  return (
    <html lang={locale} className={`${thai.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
