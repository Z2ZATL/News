import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

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
  return {
    title: article.title[locale],
    description: article.excerpt[locale],
    alternates: localizedAlternates(locale, `/stories/${slug}`),
    openGraph: {
      type: "article",
      title: article.title[locale],
      description: article.excerpt[locale],
      images: [{ url: article.cover.src }],
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
  const sections = article.body[locale]
    .map((section, index) =>
      section.heading
        ? { heading: section.heading, id: `section-${String(index)}` }
        : null,
    )
    .filter((section): section is { heading: string; id: string } => section !== null);

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
            priority
          />
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
          {article.body[locale].map((section, index) => (
            <section
              className={section.heading ? undefined : styles.intro}
              id={section.heading ? `section-${String(index)}` : undefined}
              key={section.heading ?? `intro-${String(index)}`}
            >
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.image ? (
                <figure className={styles.sectionFigure}>
                  <a href={section.image.src} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={section.image.src}
                      alt={section.image.alt}
                      width={section.image.width}
                      height={section.image.height}
                      sizes="(max-width: 900px) calc(100vw - 40px), 780px"
                    />
                  </a>
                  <figcaption>{section.image.caption}</figcaption>
                </figure>
              ) : null}
              {section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </section>
          ))}
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
