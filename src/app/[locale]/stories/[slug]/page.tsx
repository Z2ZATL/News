import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleReactionsLoader } from "@/components/article-reactions-loader";
import { ArticleBody } from "@/components/article-body";
import { JsonLd } from "@/components/json-ld";
import { ReadingProgress } from "@/components/reading-progress";
import { getArticle } from "@/lib/content";
import { formatArticleDate } from "@/lib/format-date";
import { isLocale, ui } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

import styles from "./article.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug, { draft: (await draftMode()).isEnabled });
  if (!article) return {};
  const title = article.seo?.metaTitle[locale] ?? article.title[locale];
  const description = article.seo?.metaDesc[locale] ?? article.excerpt[locale];
  const socialImage = article.seo?.ogImage?.src ?? article.cover.src;
  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/stories/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      images: [{ url: socialImage }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getArticle(slug, { draft: (await draftMode()).isEnabled });
  if (!article) notFound();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const date = formatArticleDate(article.publishedAt, locale);
  const sections = article.body[locale].flatMap((block) => {
    if (block._type !== "block" || (block.style !== "h2" && block.style !== "h3")) return [];
    const heading = block.children
      .map((child) => ("text" in child && typeof child.text === "string" ? child.text : ""))
      .join("")
      .trim();
    return heading && block._key ? [{ heading, id: `section-${block._key}` }] : [];
  });

  return (
    <article className={styles.article}>
      <ReadingProgress />
      <JsonLd
        nonce={nonce}
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title[locale],
          description: article.excerpt[locale],
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: { "@type": "Person", name: article.author.name },
          image: new URL(article.cover.src, SITE_URL).toString(),
          mainEntityOfPage: `${SITE_URL}/${locale}/stories/${article.slug}`,
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className="page-kicker">{article.category[locale]} / REPORT 001</p>
          <h1>{article.title[locale]}</h1>
          <p className={styles.excerpt}>{article.excerpt[locale]}</p>
          <div className={styles.meta}>
            <span>{ui[locale].by} {article.author.name}</span>
            <span>{ui[locale].published} {date}</span>
            <span>{article.readingMinutes} {ui[locale].minutes}</span>
          </div>
        </div>
      </header>
      {article.video ? (
        <figure className={[styles.cover, styles.videoCover].join(" ")}>
          <div className={styles.videoFrame}>
            <a
              className={styles.videoPoster}
              href={article.video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={article.cover.src}
                alt={article.cover.alt[locale]}
                width={article.cover.width ?? 1920}
                height={article.cover.height ?? 1080}
                sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1480px) 96vw, 1440px"
                priority
              />
              <span>{locale === "th" ? "เปิดวิดีโอต้นฉบับ" : "Open original video"}</span>
            </a>
            <iframe
              src={article.video.embedUrl}
              title={article.video.title[locale]}
              width={1280}
              height={720}
              allow="autoplay; fullscreen; picture-in-picture"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <figcaption>
            {locale === "th" ? "วิดีโอต้นฉบับจาก " : "Original video from "}
            <a href={article.video.sourceUrl} target="_blank" rel="noopener noreferrer">
              OpenAI <span aria-hidden="true">↗</span>
            </a>
          </figcaption>
        </figure>
      ) : (
        <figure className={styles.cover}>
          <Image
            src={article.cover.src}
            alt={article.cover.alt[locale]}
            width={article.cover.width ?? 1456}
            height={article.cover.height ?? 1456}
            sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1348px) 92vw, 1240px"
          />
          {article.cover.caption ? (
            <figcaption>{article.cover.caption[locale]}</figcaption>
          ) : null}
        </figure>
      )}
      <div className={styles.articleGrid}>
        <aside className={styles.rail}>
          <p>{locale === "th" ? "ในบทความนี้" : "In this story"}</p>
          <nav aria-label={locale === "th" ? "หัวข้อในบทความ" : "Article sections"}>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.heading.replace(/^\d+\.\s*/, "")}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <div className={styles.body}>
          <div className={styles.intro}>
            <ArticleBody value={article.body[locale]} />
          </div>
          <ArticleReactionsLoader
            articleTitle={article.title[locale]}
            locale={locale}
            slug={article.slug}
          />
          <section className={styles.sources}>
            <p className="page-kicker">SOURCES / {String(article.sources.length).padStart(2, "0")}</p>
            <h2>{ui[locale].sources}</h2>
            <ol>
              {article.sources.map((source, index) => (
                <li key={source.url}>
                  <a href={source.url} rel="noopener noreferrer" target="_blank">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {source.label[locale]}
                    <b aria-hidden="true">↗</b>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}
