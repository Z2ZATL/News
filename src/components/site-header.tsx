import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./site-header.module.css";

export function SiteHeader({ locale }: Readonly<{ locale: Locale }>) {
  const labels = ui[locale];
  const alternate = locale === "th" ? "en" : "th";

  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand} aria-label="Z2Zs Labs home">
        <Image src="/images/z2zs-mark.png" width={64} height={64} alt="" priority unoptimized />
        <span>Z2Zs Labs</span>
        <span className={styles.signal} aria-hidden="true" />
      </Link>
      <nav className={styles.nav} aria-label={locale === "th" ? "เมนูหลัก" : "Primary navigation"}>
        <Link href={`/${locale}/stories`}>{labels.stories}</Link>
        <Link href={`/${locale}/projects`}>{labels.projects}</Link>
        <Link href={`/${locale}/about`}>{labels.about}</Link>
      </nav>
      <div className={styles.actions}>
        <Link href={`/${locale}/search`} className={styles.search}>
          {labels.search}
        </Link>
        <Link href={`/${alternate}`} className={styles.language} hrefLang={alternate}>
          {alternate.toUpperCase()}
        </Link>
        <details className={styles.mobileMenu}>
          <summary aria-label={locale === "th" ? "เปิดเมนู" : "Open menu"}>
            <span />
            <span />
          </summary>
          <nav aria-label={locale === "th" ? "เมนูมือถือ" : "Mobile navigation"}>
            <Link href={`/${locale}/stories`}>{labels.stories}</Link>
            <Link href={`/${locale}/projects`}>{labels.projects}</Link>
            <Link href={`/${locale}/about`}>{labels.about}</Link>
            <Link href={`/${locale}/search`}>{labels.search}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
