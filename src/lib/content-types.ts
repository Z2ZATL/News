import type { Locale } from "@/lib/i18n";
import type { PortableTextBlock } from "@portabletext/react";

export interface LocalizedText {
  th: string;
  en: string;
}

export interface LegacyArticleSection {
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

export interface ArticleImageBlock {
  _key: string;
  _type: "articleImage";
  alt: string;
  caption: string;
  height: number;
  src: string;
  width: number;
}

export type ArticleBody = Array<PortableTextBlock | ArticleImageBlock>;

export interface Article {
  slug: string;
  atlasLocation: {
    countryCode: string;
    latitude: number;
    longitude: number;
    label: LocalizedText;
  };
  title: LocalizedText;
  excerpt: LocalizedText;
  body: Record<Locale, ArticleBody>;
  cover: {
    src: string;
    alt: LocalizedText;
    caption?: LocalizedText;
    width?: number;
    height?: number;
  };
  seo?: {
    metaTitle: LocalizedText;
    metaDesc: LocalizedText;
    ogImage?: {
      src: string;
      width: number;
      height: number;
    };
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

export interface LegacyArticle extends Omit<Article, "body"> {
  body: Record<Locale, LegacyArticleSection[]>;
}

export interface Project {
  body: Record<Locale, ArticleBody>;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  promoted: boolean;
  links: string[];
}

export interface SiteSettings {
  siteTitle: LocalizedText;
  footer: LocalizedText;
  socialLinks: string[];
}
