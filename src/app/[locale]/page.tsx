import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Atlas } from "@/components/atlas";
import { Reveal } from "@/components/reveal";
import { getArticles } from "@/lib/content";
import { formatArticleDate } from "@/lib/format-date";
import { isLocale, ui } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "th" ? "ข่าว เทคโนโลยี และบทวิเคราะห์" : "Technology, reports, and experiments",
    description:
      locale === "th"
        ? "ข่าวเทคโนโลยี บทวิเคราะห์ และบันทึกจากการทดลองใช้จริง พร้อมแหล่งข้อมูลที่ย้อนกลับไปตรวจสอบได้"
        : "Technology reporting, analysis, and notes from hands-on testing, with sources you can inspect.",
    alternates: isLocale(locale) ? localizedAlternates(locale) : undefined,
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await getArticles();
  const featured = articles[0];
  if (!featured) notFound();

  return (
    <>
      <Atlas articles={articles} locale={locale} />
      <section className={styles.editorial}>
        <Reveal className={styles.heading}>
          <div>
            <p className="page-kicker">{ui[locale].latest}</p>
            <span className={styles.issue}>ISSUE 001 / JUL 2026</span>
          </div>
          <div>
            <h2>{locale === "th" ? "ลองให้จริง แล้วค่อยเล่า" : "Test it first. Then tell the story."}</h2>
            <p className={styles.intro}>
              {locale === "th"
                ? "เราเริ่มจากการใช้งานจริง ไล่อ่านเอกสาร และแยกสิ่งที่ตรวจสอบได้ออกจากความเห็น เพื่อให้เรื่องเทคโนโลยีอ่านรู้เรื่องโดยไม่ข้ามรายละเอียดสำคัญ"
                : "We test the product, read the documents, and separate evidence from opinion—so complex technology stays readable without losing what matters."}
            </p>
          </div>
        </Reveal>
        <Reveal className={styles.story}>
          <div className={styles.visual}>
            <span className={styles.storyNumber}>01</span>
            <Link href={`/${locale}/stories/${featured.slug}`} className={styles.imageLink}>
              <Image
                src={featured.cover.src}
                alt={featured.cover.alt[locale]}
                width={1456}
                height={1456}
                sizes="(max-width: 760px) 100vw, 48vw"
              />
            </Link>
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.meta}>
              {featured.category[locale]} / {formatArticleDate(featured.publishedAt, locale)}
            </p>
            <h3><Link href={`/${locale}/stories/${featured.slug}`}>{featured.title[locale]}</Link></h3>
            <span>{featured.excerpt[locale]}</span>
            <p className={styles.byline}>{ui[locale].by} {featured.author.name}</p>
            <Link className={styles.textLink} href={`/${locale}/stories/${featured.slug}`}>
              {ui[locale].read} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
