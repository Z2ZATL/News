import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticles } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";

import styles from "./stories.module.css";

export default async function Stories({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await getArticles();

  return (
    <div className="page-shell">
      <p className="page-kicker">INDEX / 01</p>
      <h1 className="page-title">{ui[locale].stories}</h1>
      <p className="lede">
        {locale === "th"
          ? "ข่าว บทวิเคราะห์ และบันทึกจากการลองใช้เทคโนโลยีจริง พร้อมลิงก์ให้ย้อนกลับไปตรวจที่มาได้"
          : "Reporting, analysis, and notes from hands-on technology testing, with sources you can inspect."}
      </p>
      <div className={styles.list}>
        {articles.map((article, index) => (
          <Link className={styles.item} href={`/${locale}/stories/${article.slug}`} key={article.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p>{article.category[locale]}</p>
              <h2>{article.title[locale]}</h2>
              <small>{article.excerpt[locale]}</small>
            </div>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
