import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticles } from "@/lib/content";
import { formatArticleDate } from "@/lib/format-date";
import { isLocale, ui } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

import styles from "./stories.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: ui[locale].stories,
    description:
      locale === "th"
        ? "รวมข่าว บทวิเคราะห์ และบันทึกจากการทดลองใช้เทคโนโลยีจริง พร้อมแหล่งข้อมูลสำหรับตรวจสอบ"
        : "Reporting, analysis, and notes from hands-on technology testing, with sources you can inspect.",
    alternates: localizedAlternates(locale, "/stories"),
  };
}

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
              <p>{article.category[locale]} / {formatArticleDate(article.publishedAt, locale)}</p>
              <h2>{article.title[locale]}</h2>
              <small>{article.excerpt[locale]}</small>
              <small className={styles.byline}>{ui[locale].by} {article.author.name}</small>
            </div>
            <div className={styles.cover}>
              <Image
                src={article.cover.src}
                alt={article.cover.alt[locale]}
                width={article.cover.width ?? 640}
                height={article.cover.height ?? 400}
                sizes="(max-width: 640px) calc(100vw - 86px), 280px"
                priority={index === 0}
              />
            </div>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
