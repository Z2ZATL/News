import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
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
      <AtlasCanvasLoader />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.axis}>
        <span>01</span>
        <span>{locale === "th" ? "เรื่องเด่น" : "Featured story"}</span>
      </div>
      <div className={styles.copy}>
        <span className={styles.category}>{article.category[locale]}</span>
        <h1>{article.title[locale]}</h1>
        <p>{article.excerpt[locale]}</p>
        <Link className={styles.read} href={`/${locale}/stories/${article.slug}`}>
          <span>{ui[locale].read}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <Link
        href={`/${locale}/stories/${article.slug}`}
        className={styles.node}
        aria-label={`${ui[locale].read}: ${article.title[locale]}`}
      >
        <span className={styles.nodeCore} />
        <span className={styles.nodeLabel}>OKMD / AI</span>
      </Link>
      <div className={styles.coordinate} aria-hidden="true">
        13.7563° N<br />
        100.5018° E
      </div>
      <div className={styles.scrollHint} aria-hidden="true">
        <span />
        {locale === "th" ? "เลื่อนเพื่ออ่านต่อ" : "Scroll to continue"}
      </div>
    </section>
  );
}
