"use client";

import Link from "next/link";
import type { Route } from "next";
import { useDeferredValue, useState } from "react";

import type { Article, Project } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

import styles from "./search-index.module.css";

export function SearchIndex({ articles, locale, projects }: Readonly<{
  articles: Article[];
  locale: Locale;
  projects: Project[];
}>) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase(locale));
  const items = [
    ...articles.map((article) => ({
      category: article.category[locale],
      href: `/${locale}/stories/${article.slug}` as Route,
      search: `${article.title[locale]} ${article.excerpt[locale]} ${article.tags.join(" ")}`,
      title: article.title[locale],
    })),
    ...projects.map((project) => ({
      category: locale === "th" ? "ห้องทดลอง" : "Lab",
      href: `/${locale}/projects/${project.slug}` as Route,
      search: `${project.title[locale]} ${project.summary[locale]}`,
      title: project.title[locale],
    })),
  ];
  const results = items.filter((item) =>
    item.search.toLocaleLowerCase(locale).includes(deferredQuery),
  );

  return (
    <div>
      <label className={styles.label} htmlFor="site-search">
        {locale === "th" ? "ค้นหาจากชื่อ เรื่องย่อ หรือแท็ก" : "Search titles, summaries, or tags"}
      </label>
      <input
        id="site-search"
        className={styles.input}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
        }}
        autoComplete="off"
      />
      <p className={styles.count} aria-live="polite">{results.length} {locale === "th" ? "ผลลัพธ์" : "results"}</p>
      <div className={styles.results}>
        {results.map((item) => (
          <Link href={item.href} key={item.href}>
            <span>{item.category}</span>
            <h2>{item.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
