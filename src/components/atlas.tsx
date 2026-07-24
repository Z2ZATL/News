import Link from "next/link";

import { AtlasCanvasLoader } from "@/components/atlas-canvas-loader";
import type { Article } from "@/lib/content-types";
import { formatArticleDate } from "@/lib/format-date";
import type { AtlasMapNode } from "@/lib/atlas-types";
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

const storyLocations: Record<
  string,
  Pick<AtlasMapNode, "latitude" | "longitude" | "location" | "offset">
> = {
  "okmd-ai-playground-review": {
    latitude: 13.7463,
    longitude: 100.5394,
    location: "Pathum Wan, Bangkok, Thailand",
    offset: [-22, -12],
  },
  "gpt-5-6-luna-terra-sol": {
    latitude: 37.7749,
    longitude: -122.4194,
    location: "San Francisco, California, USA",
    offset: [-20, -15],
  },
  "chatgpt-gpt-live-voice-update": {
    latitude: 37.7749,
    longitude: -122.4194,
    location: "San Francisco, California, USA",
    offset: [22, 15],
  },
  "kimi-k3-frontend-arena": {
    latitude: 39.9042,
    longitude: 116.4074,
    location: "Beijing, China",
    offset: [4, -18],
  },
  "th-ai-passport-hands-on-review": {
    latitude: 13.8847,
    longitude: 100.5656,
    location: "Lak Si, Bangkok, Thailand",
    offset: [22, 12],
  },
  "google-weather-lab-weathernext-2": {
    latitude: 37.422,
    longitude: -122.0841,
    location: "Mountain View, California, USA",
    offset: [18, -26],
  },
  "th-ai-passport-recap-developer-tools": {
    latitude: 13.8847,
    longitude: 100.5656,
    location: "Lak Si, Bangkok, Thailand",
    offset: [-18, 24],
  },
};

const fallbackLocation = {
  latitude: 0,
  longitude: 0,
  location: "Global",
  offset: [0, 0] as const,
};

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
      const coordinates = storyLocations[item.slug] ?? fallbackLocation;
      return {
        ...coordinates,
        href: `/${locale}/stories/${item.slug}` as AtlasMapNode["href"],
        indexLabel: String(index + 1).padStart(2, "0"),
        kind: "story" as const,
        label: labels[item.slug] ?? item.category[locale],
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
