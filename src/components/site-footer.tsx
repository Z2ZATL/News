import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/content-types";

import styles from "./site-footer.module.css";

export function SiteFooter({ locale, settings }: Readonly<{ locale: Locale; settings: SiteSettings }>) {
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.eyebrow}>{settings.siteTitle[locale]} / Bangkok</p>
        <p className={styles.statement}>{settings.footer[locale]}</p>
      </div>
      <nav aria-label={locale === "th" ? "ข้อมูลทางกฎหมาย" : "Legal"}>
        <Link href={`/${locale}/privacy`}>{locale === "th" ? "ความเป็นส่วนตัว" : "Privacy"}</Link>
        <Link href={`/${locale}/terms`}>{locale === "th" ? "ข้อกำหนด" : "Terms"}</Link>
      </nav>
      <p className={styles.copyright}>© 2026 {settings.siteTitle[locale]}</p>
    </footer>
  );
}
