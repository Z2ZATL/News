"use client";

import Link from "next/link";
import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";

import type { NewsCategory } from "@/components/category-news-browser";
import type { Locale } from "@/lib/i18n";

import styles from "./category-news-browser.module.css";

interface CategoryBrowserProps {
  categories: NewsCategory[];
  locale: Locale;
}

export function CategoryNewsBrowserLoader(
  props: Readonly<CategoryBrowserProps>,
) {
  const boundary = useRef<HTMLElement>(null);
  const [Browser, setBrowser] = useState<ComponentType<CategoryBrowserProps> | null>(
    null,
  );

  useEffect(() => {
    const target = boundary.current;
    if (!target) return;

    let active = true;
    const load = () => {
      void import("@/components/category-news-browser").then((module) => {
        if (active) setBrowser(() => module.CategoryNewsBrowser);
      });
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      // The Atlas fills the opening viewport. Loading the image-heavy browser
      // almost a full screen early made it compete with Thai text rendering
      // during the first paint on slower phones. A small lead still upgrades
      // the index before it is normally reached without paying that cost at
      // page load.
      { rootMargin: "160px 0px" },
    );
    observer.observe(target);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  if (Browser) return <Browser {...props} />;

  return (
    <section
      aria-labelledby="category-news-title"
      className={styles.section}
      data-category-browser="waiting"
      ref={boundary}
    >
      <header className={styles.heading}>
        <p>NEWS / BY SUBJECT</p>
        <div>
          <h1 id="category-news-title">
            {props.locale === "th"
              ? "เลือกหมวดข่าวที่คุณสนใจ"
              : "Choose a subject, then a story"}
          </h1>
          <span>
            {props.locale === "th"
              ? "เลือกอ่านข่าวและบทวิเคราะห์ตามหัวข้อที่คุณอยากติดตาม"
              : "Browse reporting and analysis by the subjects you follow."}
          </span>
        </div>
      </header>
      <nav
        aria-label={props.locale === "th" ? "ข่าวแยกตามหมวดหมู่" : "Stories by category"}
        className={styles.staticIndex}
      >
        {props.categories.map((category, index) => (
          <section key={category.id}>
            <h2>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {category.label}
            </h2>
            {category.stories.map((story) => (
              <Link href={`/${props.locale}/stories/${story.slug}`} key={story.slug}>
                {story.title}
                <small>{story.author}</small>
              </Link>
            ))}
          </section>
        ))}
      </nav>
    </section>
  );
}
