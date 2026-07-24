import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
import { formatArticleDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./atlas.module.css";

const labels: Record<string, string> = {
  "okmd-ai-playground-review": "OKMD / AI",
  "gpt-5-6-luna-terra-sol": "GPT-5.6",
  "chatgpt-gpt-live-voice-update": "GPT-LIVE",
  "kimi-k3-frontend-arena": "KIMI K3",
  "th-ai-passport-hands-on-review": "TH AI / REVIEW",
  "google-weather-lab-weathernext-2": "WEATHER LAB",
  "th-ai-passport-recap-developer-tools": "TH AI / RECAP",
};

const products = [{ slug: "lumixia-brief", label: "LUMIXIA BRIEF" }] as const;

export function Atlas({
  articles,
  locale,
}: Readonly<{
  articles: Article[];
  locale: Locale;
}>) {
  const article = articles[0];
  if (!article) return null;

  return (
    <section className={styles.atlas} aria-label={ui[locale].atlasLabel}>
      <div className={styles.globeStage}>
        <AtlasCanvasLoader />
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.colorWash} aria-hidden="true" />

        <div className={styles.axis}>
          <span>{String(articles.length).padStart(2, "0")}</span>
          <span>Z2ZS / SIGNALS</span>
        </div>

        <div className={styles.orbitCaption} aria-hidden="true">
          <span>{locale === "th" ? "มองเทคโนโลยีจากโลกจริง" : "Technology, viewed from the real world"}</span>
          <b>13.7563° N · 100.5018° E</b>
        </div>

        <div className={styles.legend} aria-hidden="true">
          <span><i className={styles.legendStory} />{locale === "th" ? "ข่าว" : "Stories"}</span>
          <span><i className={styles.legendProduct} />{locale === "th" ? "ผลิตภัณฑ์" : "Products"}</span>
        </div>

        <nav
          className={styles.nodes}
          aria-label={locale === "th" ? "ข่าวบนแผนที่โลก" : "Stories on the globe"}
        >
          {articles.map((item, index) => (
            <Link
              href={`/${locale}/stories/${item.slug}`}
              className={styles.node}
              data-kind="story"
              aria-label={`${String(index + 1).padStart(2, "0")}. ${item.title[locale]}`}
              key={item.slug}
            >
              <span className={styles.nodeCore} />
              <span className={styles.nodeLabel}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {labels[item.slug] ?? item.category[locale]}
              </span>
            </Link>
          ))}
          {products.map((product, index) => (
            <Link
              href={`/${locale}/projects/${product.slug}`}
              className={styles.node}
              data-kind="product"
              data-featured="true"
              aria-label={`${locale === "th" ? "ผลิตภัณฑ์" : "Product"}: ${product.label}`}
              key={product.slug}
            >
              <span className={styles.nodeCore} />
              <span className={styles.nodeLabel}>
                <b>P{String(index + 1).padStart(2, "0")}</b>
                {product.label}
              </span>
            </Link>
          ))}
        </nav>

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
