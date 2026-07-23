import Link from "next/link";

import type { Locale } from "@/lib/i18n";

import styles from "./site-footer.module.css";

export function SiteFooter({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.eyebrow}>Z2Zs Labs / Bangkok</p>
        <p className={styles.statement}>
          {locale === "th"
            ? "เล่าเรื่องเทคโนโลยีให้เข้าใจง่าย โดยไม่ละทิ้งรายละเอียดที่สำคัญ"
            : "Technology reporting that stays clear without losing the details that matter."}
        </p>
      </div>
      <nav aria-label={locale === "th" ? "ข้อมูลทางกฎหมาย" : "Legal"}>
        <Link href={`/${locale}/privacy`}>{locale === "th" ? "ความเป็นส่วนตัว" : "Privacy"}</Link>
        <Link href={`/${locale}/terms`}>{locale === "th" ? "ข้อกำหนด" : "Terms"}</Link>
      </nav>
      <p className={styles.copyright}>© 2026 Z2Zs Labs</p>
    </footer>
  );
}
