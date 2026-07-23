import "server-only";

import { createClient } from "@sanity/client";

import { launchArticle } from "@/content/launch-article";
import type { Article } from "@/lib/content-types";
import type { ArticleSection, LocalizedText } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_READ_TOKEN;

const sanity =
  projectId && token
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2025-01-01",
        token,
        useCdn: true,
        perspective: "published",
      })
    : null;

const articleQuery = `*[_type == "article" && status == "published"] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  excerpt,
  "cover": {
    "src": cover.asset->url,
    "alt": cover.alt
  },
  "category": category->title,
  author->{name, role},
  body,
  tags,
  sources,
  featured,
  publishedAt,
  updatedAt,
  "readingMinutes": 9
}`;

interface PortableSpan {
  _type?: string;
  text?: string;
}

interface PortableBlock {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: PortableSpan[];
}

interface RemoteArticle extends Omit<Article, "body"> {
  body?: Partial<Record<Locale, PortableBlock[]>>;
}

function blockText(block: PortableBlock): string {
  return block.children?.map((child) => child.text ?? "").join("") ?? "";
}

function toSections(blocks: PortableBlock[] | undefined): ArticleSection[] {
  const sections: ArticleSection[] = [{ paragraphs: [] }];
  for (const block of blocks ?? []) {
    if (block._type !== "block") continue;
    const text = blockText(block).trim();
    if (!text) continue;
    if (block.style === "h2" || block.style === "h3") {
      sections.push({ heading: text, paragraphs: [] });
      continue;
    }
    const current = sections.at(-1);
    if (!current) continue;
    if (block.listItem) {
      current.bullets = [...(current.bullets ?? []), text];
    } else {
      current.paragraphs.push(text);
    }
  }
  return sections.filter((section) => section.heading || section.paragraphs.length || section.bullets?.length);
}

function normalizeArticle(article: RemoteArticle): Article {
  return {
    ...article,
    category: article.category as LocalizedText,
    body: {
      th: toSections(article.body?.th),
      en: toSections(article.body?.en),
    },
  };
}

export async function getArticles(): Promise<Article[]> {
  if (!sanity) {
    return [launchArticle];
  }

  const remote = await sanity.fetch<RemoteArticle[]>(articleQuery, {}, {
    next: { tags: ["article"] },
  });

  return remote.length > 0 ? remote.map(normalizeArticle) : [launchArticle];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}
