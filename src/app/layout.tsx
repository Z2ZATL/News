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

const themeInit = `(()=>{const key="z2zs:theme";const read=()=>{try{return localStorage.getItem(key)==="light"?"light":"dark"}catch{return"dark"}};const apply=theme=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;document.querySelectorAll("[data-theme-choice]").forEach(button=>button.setAttribute("aria-pressed",String(button.getAttribute("data-theme-choice")===theme)))};apply(read());document.addEventListener("DOMContentLoaded",()=>apply(read()),{once:true});document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest("[data-theme-choice]"):null;if(!(target instanceof HTMLButtonElement))return;const theme=target.dataset.themeChoice==="light"?"light":"dark";try{localStorage.setItem(key,theme)}catch{}apply(theme);target.closest("details")?.removeAttribute("open")});document.addEventListener("pointerdown",event=>{document.querySelectorAll("details[data-theme-menu][open]").forEach(menu=>{if(!menu.contains(event.target))menu.removeAttribute("open")})});document.addEventListener("keydown",event=>{if(event.key==="Escape")document.querySelectorAll("details[data-theme-menu][open]").forEach(menu=>menu.removeAttribute("open"))});window.addEventListener("storage",event=>{if(event.key===key)apply(event.newValue==="light"?"light":"dark")})})()`;

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
      <body>
        {children}
        <script nonce={nonce} src="/article-reactions-bootstrap.js" defer />
      </body>
    </html>
  );
}
