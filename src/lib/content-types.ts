import type { Locale } from "@/lib/i18n";

export interface LocalizedText {
  th: string;
  en: string;
}

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: Record<Locale, ArticleSection[]>;
  cover: {
    src: string;
    alt: LocalizedText;
    width?: number;
    height?: number;
  };
  category: LocalizedText;
  author: {
    name: string;
    role: LocalizedText;
  };
  tags: string[];
  sources: Array<{
    label: LocalizedText;
    url: string;
  }>;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}
