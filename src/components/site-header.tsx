import Image from "next/image";
import Link from "next/link";

import { ThemeMenu } from "@/components/theme-menu";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./site-header.module.css";

export function SiteHeader({ locale }: Readonly<{ locale: Locale }>) {
  const labels = ui[locale];
  const alternate = locale === "th" ? "en" : "th";

  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} prefetch={false} className={styles.brand} aria-label="Z2Zs Lab home">
        <Image
          alt=""
          fetchPriority="high"
          height={64}
          priority
          src="/images/z2zs-mark.webp"
          unoptimized
          width={64}
        />
        <span>Z2Zs Lab</span>
        <span className={styles.signal} aria-hidden="true" />
      </Link>
      <nav className={styles.nav} aria-label={locale === "th" ? "เมนูหลัก" : "Primary navigation"}>
        <Link href={`/${locale}/stories`} prefetch={false}>{labels.stories}</Link>
        <Link href={`/${locale}/projects`} prefetch={false}>{labels.projects}</Link>
        <Link href={`/${locale}/about`} prefetch={false}>{labels.about}</Link>
      </nav>
      <div className={styles.actions}>
        <ThemeMenu locale={locale} />
        <Link href={`/${locale}/search`} prefetch={false} className={styles.search}>
          {labels.search}
        </Link>
        <Link href={`/${alternate}`} prefetch={false} className={styles.language} hrefLang={alternate}>
          {alternate.toUpperCase()}
        </Link>
        <details className={styles.mobileMenu}>
          <summary aria-label={locale === "th" ? "เปิดเมนู" : "Open menu"}>
            <span />
            <span />
          </summary>
          <nav aria-label={locale === "th" ? "เมนูมือถือ" : "Mobile navigation"}>
            <Link href={`/${locale}/stories`} prefetch={false}>{labels.stories}</Link>
            <Link href={`/${locale}/projects`} prefetch={false}>{labels.projects}</Link>
            <Link href={`/${locale}/about`} prefetch={false}>{labels.about}</Link>
            <Link href={`/${locale}/search`} prefetch={false}>{labels.search}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
