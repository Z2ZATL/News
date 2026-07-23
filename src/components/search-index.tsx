"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { Article } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

import styles from "./search-index.module.css";

export function SearchIndex({ articles, locale }: Readonly<{ articles: Article[]; locale: Locale }>) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase(locale));
  const results = articles.filter((article) => {
    const haystack = `${article.title[locale]} ${article.excerpt[locale]} ${article.tags.join(" ")}`.toLocaleLowerCase(locale);
    return haystack.includes(deferredQuery);
  });

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
        onChange={(event) => setQuery(event.currentTarget.value)}
        autoComplete="off"
      />
      <p className={styles.count} aria-live="polite">{results.length} {locale === "th" ? "ผลลัพธ์" : "results"}</p>
      <div className={styles.results}>
        {results.map((article) => (
          <Link href={`/${locale}/stories/${article.slug}`} key={article.slug}>
            <span>{article.category[locale]}</span>
            <h2>{article.title[locale]}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
