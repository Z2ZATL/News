"use client";

import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useRef, useState } from "react";

import { formatArticleDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";

import styles from "./category-news-browser.module.css";

export interface NewsCategory {
  id: string;
  label: string;
  stories: Array<{
    author: string;
    cover: {
      alt: string;
      src: string;
    };
    excerpt: string;
    publishedAt: string;
    slug: string;
    title: string;
  }>;
}

export function CategoryNewsBrowser({
  categories,
  locale,
}: Readonly<{
  categories: NewsCategory[];
  locale: Locale;
}>) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");
  const categoryButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected =
    categories.find((category) => category.id === selectedId) ?? categories[0];

  if (!selected) return null;

  function selectFromKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const lastIndex = categories.length - 1;
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === undefined) return;
    const nextCategory = categories[nextIndex];
    if (!nextCategory) return;

    event.preventDefault();
    setSelectedId(nextCategory.id);
    categoryButtons.current[nextIndex]?.focus();
  }

  return (
    <section
      aria-labelledby="category-news-title"
      className={styles.section}
      data-category-browser
    >
      <header className={styles.heading}>
        <p>NEWS / BY SUBJECT</p>
        <div>
          <h1 id="category-news-title">
            {locale === "th" ? "เลือกหมวดข่าวที่คุณสนใจ" : "Choose a subject, then a story"}
          </h1>
          <span>
            {locale === "th"
              ? "เลือกอ่านข่าวและบทวิเคราะห์ตามหัวข้อที่คุณอยากติดตาม"
              : "Browse reporting and analysis by the subjects you follow."}
          </span>
        </div>
      </header>

      <div className={styles.browser}>
        <div
          aria-label={locale === "th" ? "เลือกหมวดหมู่ข่าว" : "Choose a news category"}
          className={styles.categoryList}
          role="tablist"
        >
          {categories.map((category, index) => {
            const active = category.id === selected.id;
            return (
              <button
                aria-controls="category-panel"
                aria-selected={active}
                className={styles.categoryButton}
                id={`category-tab-${category.id}`}
                key={category.id}
                onClick={() => {
                  setSelectedId(category.id);
                }}
                onKeyDown={(event) => {
                  selectFromKeyboard(event, index);
                }}
                ref={(element) => {
                  categoryButtons.current[index] = element;
                }}
                role="tab"
                tabIndex={active ? 0 : -1}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.label}</strong>
                <small>{String(category.stories.length).padStart(2, "0")}</small>
              </button>
            );
          })}
        </div>

        <div
          aria-labelledby={`category-tab-${selected.id}`}
          className={styles.panel}
          id="category-panel"
          key={selected.id}
          role="tabpanel"
        >
          <div className={styles.panelHeading}>
            <h2>{selected.label}</h2>
            <span>
              {locale === "th"
                ? `${String(selected.stories.length)} เรื่องในหมวดนี้`
                : `${String(selected.stories.length)} ${selected.stories.length === 1 ? "story" : "stories"}`}
            </span>
          </div>

          <div className={styles.storyGrid}>
            {selected.stories.map((story) => (
              <article
                className={styles.storyCard}
                data-category-story
                key={story.slug}
              >
                <Link className={styles.coverLink} href={`/${locale}/stories/${story.slug}`}>
                  <Image
                    alt={story.cover.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 60vw, 34vw"
                    src={story.cover.src}
                  />
                </Link>
                <div className={styles.storyCopy}>
                  <p>
                    {formatArticleDate(story.publishedAt, locale)}
                    <span aria-hidden="true"> / </span>
                    {locale === "th" ? "โดย" : "By"} {story.author}
                  </p>
                  <h3>
                    <Link href={`/${locale}/stories/${story.slug}`}>{story.title}</Link>
                  </h3>
                  <span>{story.excerpt}</span>
                  <Link className={styles.openStory} href={`/${locale}/stories/${story.slug}`}>
                    {locale === "th" ? "เปิดอ่าน" : "Read story"}
                    <i aria-hidden="true">↗</i>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <noscript>
        <div className={styles.noScriptStories}>
          {categories.flatMap((category) =>
            category.stories.map((story) => (
              <Link href={`/${locale}/stories/${story.slug}`} key={story.slug}>
                {category.label} / {story.title}
              </Link>
            )),
          )}
        </div>
      </noscript>
    </section>
  );
}
