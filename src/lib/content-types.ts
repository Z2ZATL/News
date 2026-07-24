import type { Locale } from "@/lib/i18n";

export interface LocalizedText {
  th: string;
  en: string;
}

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
  image?: {
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  };
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
  video?: {
    embedUrl: string;
    sourceUrl: string;
    title: LocalizedText;
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
