import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
import { getAtlasCountry } from "@/lib/atlas-countries";
import type { AtlasMapNode } from "@/lib/atlas-types";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";

import styles from "./atlas.module.css";

const products = [
  {
    author: "Z2Zs Lab",
    countryCode: "TH",
    label: "Lumixia Brief",
    latitude: 13.7563,
    longitude: 100.5018,
    slug: "lumixia-brief",
  },
] as const;

export function Atlas({
  articles,
  locale,
}: Readonly<{
  articles: Article[];
  locale: Locale;
}>) {
  const latestArticle = articles[0];
  if (!latestArticle) return null;
  const articleGroups = new Map<string, Article[]>();
  for (const item of articles) {
    const current = articleGroups.get(item.atlasLocation.countryCode) ?? [];
    articleGroups.set(item.atlasLocation.countryCode, [...current, item]);
  }
  const storyNodes: AtlasMapNode[] = [...articleGroups.entries()].map(
    ([countryCode, countryArticles]) => {
      const country = getAtlasCountry(countryCode);
      const first = countryArticles[0];
      if (!first) throw new Error(`Atlas country ${countryCode} has no articles.`);
      const countryName = country?.name[locale] ?? first.atlasLocation.label[locale];
      return {
        accessibleLabel:
          locale === "th"
            ? `เปิดข่าวจาก${countryName} ${String(countryArticles.length)} เรื่อง`
            : `Open ${String(countryArticles.length)} stories from ${countryName}`,
        countryCode,
        id: `stories-${countryCode}`,
        kind: "story-country",
        latitude: country?.latitude ?? first.atlasLocation.latitude,
        longitude: country?.longitude ?? first.atlasLocation.longitude,
        offset: [0, 0],
        signals: countryArticles.map((item) => ({
          author: item.author.name,
          href: `/${locale}/stories/${item.slug}` as AtlasMapNode["signals"][number]["href"],
          publishedAt: item.publishedAt,
          slug: item.slug,
          title: item.title[locale],
        })),
      };
    },
  );
  const productNodes: AtlasMapNode[] = products.map((product) => ({
    accessibleLabel:
      locale === "th"
        ? `เปิดผลิตภัณฑ์ของ Z2Zs Lab ในประเทศไทย`
        : `Open Z2Zs Lab products in Thailand`,
    countryCode: product.countryCode,
    id: `products-${product.countryCode}`,
    kind: "product-country",
    latitude: product.latitude,
    longitude: product.longitude,
    offset: [40, 32],
    signals: [
      {
        author: product.author,
        href: `/${locale}/projects/${product.slug}` as AtlasMapNode["signals"][number]["href"],
        publishedAt: latestArticle.publishedAt,
        slug: product.slug,
        title: product.label,
      },
    ],
  }));
  const mapNodes = [...storyNodes, ...productNodes];

  return (
    <section className={styles.atlas} aria-label={ui[locale].atlasLabel}>
      <div className={styles.globeStage}>
        <AtlasCanvasLoader
          navigationLabel={
            locale === "th" ? "ประเทศที่มีข่าวและผลงานบนแผนที่โลก" : "Countries with stories and products"
          }
          nodes={mapNodes}
        />
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.colorWash} aria-hidden="true" />

        <div className={styles.axis}>
          <span>{String(storyNodes.length).padStart(2, "0")}</span>
          <span>Z2ZS / COUNTRIES</span>
        </div>

        <div className={styles.orbitCaption} aria-hidden="true">
          <span>{locale === "th" ? "ลากโลกเพื่อหมุน แล้วเลือกประเทศที่สนใจ" : "Drag the globe, then choose a country"}</span>
          <b>{locale === "th" ? "หนึ่งจุดต่อหนึ่งประเทศ" : "ONE POINT PER COUNTRY"}</b>
        </div>

        <div className={styles.legend} aria-hidden="true">
          <span><i className={styles.legendStory} />{locale === "th" ? "ประเทศที่มีข่าว" : "News countries"}</span>
          <span><i className={styles.legendProduct} />{locale === "th" ? "ประเทศที่มีผลงาน Lab" : "Lab countries"}</span>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span />
          {locale === "th" ? "คลิกค้างแล้วลากเพื่อหมุนโลก" : "Click and drag to spin the globe"}
        </div>
      </div>

      <noscript>
        <nav className={styles.noScriptIndex} aria-label={locale === "th" ? "ข่าวทั้งหมดในแผนที่" : "All Atlas stories"}>
          {articles.map((item) => (
            <Link href={`/${locale}/stories/${item.slug}`} key={item.slug}>
              {item.title[locale]} · {item.author.name}
            </Link>
          ))}
        </nav>
      </noscript>

    </section>
  );
}
