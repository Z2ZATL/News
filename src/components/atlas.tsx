import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
import { formatArticleDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./atlas.module.css";

export function Atlas({
  article,
  locale,
}: Readonly<{
  article: Article;
  locale: Locale;
}>) {
  return (
    <section className={styles.atlas} aria-label={ui[locale].atlasLabel}>
      <div className={styles.globeStage}>
        <AtlasCanvasLoader />
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.colorWash} aria-hidden="true" />

        <div className={styles.axis}>
          <span>01</span>
          <span>Z2ZS / ORBIT</span>
        </div>

        <div className={styles.orbitCaption} aria-hidden="true">
          <span>{locale === "th" ? "มองเทคโนโลยีจากโลกจริง" : "Technology, viewed from the real world"}</span>
          <b>13.7563° N · 100.5018° E</b>
        </div>

        <Link
          href={`/${locale}/stories/${article.slug}`}
          className={styles.node}
          aria-label={`${ui[locale].read}: ${article.title[locale]}`}
        >
          <span className={styles.nodeCore} />
          <span className={styles.nodeLabel}>OKMD / AI</span>
        </Link>

        <div className={styles.scrollHint} aria-hidden="true">
          <span />
          {locale === "th" ? "เลื่อนลงเพื่ออ่านเรื่องเด่น" : "Scroll for the featured story"}
        </div>
      </div>

      <div className={styles.copy}>
        <div className={styles.storyIdentity}>
          <span className={styles.category}>{article.category[locale]}</span>
          <span>{formatArticleDate(article.publishedAt, locale)}</span>
          <span>{ui[locale].by} {article.author.name}</span>
        </div>
        <h1>{article.title[locale]}</h1>
        <div className={styles.deck}>
          <p>{article.excerpt[locale]}</p>
          <Link className={styles.read} href={`/${locale}/stories/${article.slug}`}>
            <span>{ui[locale].read}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
