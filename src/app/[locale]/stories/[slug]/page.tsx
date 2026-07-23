import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { ReadingProgress } from "@/components/reading-progress";
import { getArticle } from "@/lib/content";
import { formatArticleDate } from "@/lib/format-date";
import { isLocale, ui } from "@/lib/i18n";

import styles from "./article.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title[locale],
    description: article.excerpt[locale],
    alternates: {
      canonical: `/${locale}/stories/${slug}`,
      languages: {
        th: `/th/stories/${slug}`,
        en: `/en/stories/${slug}`,
        "x-default": `/th/stories/${slug}`,
      },
    },
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
  const article = await getArticle(slug);
  if (!article) notFound();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const date = formatArticleDate(article.publishedAt, locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://news.z2zs.space";
  const sections = article.body[locale]
    .map((section, index) => section.heading ? { heading: section.heading, id: `section-${index}` } : null)
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
          image: new URL(article.cover.src, siteUrl).toString(),
          mainEntityOfPage: `${siteUrl}/${locale}/stories/${article.slug}`,
          publisher: { "@type": "Organization", name: "Z2Zs Lab" },
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
      <figure className={styles.cover}>
        <Image src={article.cover.src} alt={article.cover.alt[locale]} width={1456} height={1456} priority />
      </figure>
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
              id={section.heading ? `section-${index}` : undefined}
              key={section.heading ?? `intro-${index}`}
            >
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
