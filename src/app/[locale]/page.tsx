import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Atlas } from "@/components/atlas";
import {
  CategoryNewsBrowser,
  type NewsCategory,
} from "@/components/category-news-browser";
import { getArticles } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "th" ? "ข่าว เทคโนโลยี และบทวิเคราะห์" : "Technology, reports, and experiments",
    description:
      locale === "th"
        ? "ข่าวเทคโนโลยี บทวิเคราะห์ และบันทึกจากการทดลองใช้จริง พร้อมแหล่งข้อมูลที่ย้อนกลับไปตรวจสอบได้"
        : "Technology reporting, analysis, and notes from hands-on testing, with sources you can inspect.",
    alternates: isLocale(locale) ? localizedAlternates(locale) : undefined,
  };
}

function categoryId(label: string): string {
  const normalized = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (normalized) return normalized;

  return `category-${Array.from(label)
    .map((character) => character.codePointAt(0)?.toString(16) ?? "0")
    .join("-")}`;
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await getArticles();
  if (!articles.length) notFound();

  const categoryMap = new Map<string, NewsCategory>();
  for (const article of articles) {
    const id = categoryId(article.category.en);
    const category = categoryMap.get(id) ?? {
      id,
      label: article.category[locale],
      stories: [],
    };
    category.stories.push({
      author: article.author.name,
      cover: {
        alt: article.cover.alt[locale],
        src: article.cover.src,
      },
      excerpt: article.excerpt[locale],
      publishedAt: article.publishedAt,
      slug: article.slug,
      title: article.title[locale],
    });
    categoryMap.set(id, category);
  }

  return (
    <>
      <Atlas articles={articles} locale={locale} />
      <CategoryNewsBrowser categories={[...categoryMap.values()]} locale={locale} />
    </>
  );
}
