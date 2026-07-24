import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
import { formatArticleDate } from "@/lib/format-date";
import type { AtlasMapNode } from "@/lib/atlas-types";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./atlas.module.css";

const products = [{ slug: "lumixia-brief", label: "LUMIXIA BRIEF" }] as const;

const collisionOffsets = [
  [-18, -18],
  [18, 18],
  [22, -22],
  [-22, 22],
] as const;

function locationOffset(article: Article, articles: Article[]): readonly [number, number] {
  const matching = articles.filter(
    (candidate) =>
      candidate.atlasLocation.latitude === article.atlasLocation.latitude &&
      candidate.atlasLocation.longitude === article.atlasLocation.longitude,
  );
  const position = matching.findIndex((candidate) => candidate.slug === article.slug);
  return collisionOffsets[position % collisionOffsets.length] ?? [0, 0];
}

export function Atlas({
  articles,
  locale,
}: Readonly<{
  articles: Article[];
  locale: Locale;
}>) {
  const article = articles[0];
  if (!article) return null;
  const mapNodes: AtlasMapNode[] = [
    ...articles.map((item, index) => {
      return {
        href: `/${locale}/stories/${item.slug}` as AtlasMapNode["href"],
        indexLabel: String(index + 1).padStart(2, "0"),
        kind: "story" as const,
        label: item.category[locale],
        latitude: item.atlasLocation.latitude,
        longitude: item.atlasLocation.longitude,
        location: item.atlasLocation.label[locale],
        offset: locationOffset(item, articles),
      };
    }),
    ...products.map((product, index) => ({
      href: `/${locale}/projects/${product.slug}` as AtlasMapNode["href"],
      indexLabel: `P${String(index + 1).padStart(2, "0")}`,
      kind: "product" as const,
      label: product.label,
      latitude: 13.7563,
      longitude: 100.5018,
      location: "Bangkok, Thailand",
      offset: [0, -38] as const,
    })),
  ];

  return (
    <section className={styles.atlas} aria-label={ui[locale].atlasLabel}>
      <div className={styles.globeStage}>
        <AtlasCanvasLoader
          navigationLabel={
            locale === "th" ? "ข่าวและผลิตภัณฑ์บนแผนที่โลก" : "Stories and products on the globe"
          }
          nodes={mapNodes}
        />
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
