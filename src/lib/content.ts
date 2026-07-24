import "server-only";

import { createClient } from "@sanity/client";
import { defineQuery } from "groq";

import { facebookArticles } from "@/content/facebook-articles";
import { launchArticle } from "@/content/launch-article";
import type {
  Article,
  ArticleSection,
  LocalizedText,
} from "@/lib/content-types";
import type { DraftArticleQueryResult } from "@/sanity.types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_READ_TOKEN;
const localArticles = [launchArticle, ...facebookArticles];

const publishedSanity =
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

const draftSanity =
  projectId && token
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2025-01-01",
        token,
        useCdn: false,
        perspective: "drafts",
      })
    : null;

const articleQuery = defineQuery(`*[_type == "article" && status == "published"] | order(publishedAt desc) {
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
}`);
const draftArticleQuery = defineQuery(`*[_type == "article" && slug.current == $slug][0] {
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
}`);

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

type RemoteArticle = NonNullable<DraftArticleQueryResult>;

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

function normalizeLocalized(
  value:
    | {
        th?: string;
        en?: string;
      }
    | null
    | undefined,
): LocalizedText | null {
  return value?.th && value.en ? { th: value.th, en: value.en } : null;
}

function normalizeArticle(article: RemoteArticle): Article | null {
  const title = normalizeLocalized(article.title);
  const excerpt = normalizeLocalized(article.excerpt);
  const coverAlt = normalizeLocalized(article.cover.alt);
  const category = normalizeLocalized(article.category);
  const authorRole = normalizeLocalized(article.author?.role);
  if (
    !title ||
    !excerpt ||
    !coverAlt ||
    !category ||
    !authorRole ||
    !article.cover.src ||
    !article.author ||
    !article.publishedAt ||
    !article.updatedAt
  ) {
    return null;
  }

  const sources = (article.sources ?? []).flatMap((source) => {
    const label = normalizeLocalized(source.label);
    return label ? [{ label, url: source.url }] : [];
  });

  return {
    slug: article.slug,
    title,
    excerpt,
    category,
    cover: {
      src: article.cover.src,
      alt: coverAlt,
    },
    author: {
      name: article.author.name,
      role: authorRole,
    },
    body: {
      th: toSections(article.body?.th),
      en: toSections(article.body?.en),
    },
    tags: article.tags ?? [],
    sources,
    featured: article.featured ?? false,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingMinutes: article.readingMinutes,
  };
}

export async function getArticles(): Promise<Article[]> {
  if (!publishedSanity) {
    return [...localArticles].sort(
      (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
    );
  }

  const remote = await publishedSanity.fetch(articleQuery, {}, {
    next: { tags: ["article"] },
  });

  const combined = new Map(
    localArticles.map((article) => [article.slug, article] as const),
  );
  for (const article of remote.map(normalizeArticle)) {
    if (!article) continue;
    const local = combined.get(article.slug);
    if (!local) {
      combined.set(article.slug, article);
      continue;
    }

    // Sanity's schema currently does not carry local-only media (video embeds
    // and section illustrations). Keep those fields when a remote document
    // overrides the editorial copy for the same slug.
    combined.set(article.slug, {
      ...article,
      ...(article.video ?? local.video ? { video: article.video ?? local.video } : {}),
      cover: { ...local.cover, ...article.cover },
      body: {
        th: article.body.th.map((section, index) => {
          const image = section.image ?? local.body.th[index]?.image;
          return image ? { ...section, image } : section;
        }),
        en: article.body.en.map((section, index) => {
          const image = section.image ?? local.body.en[index]?.image;
          return image ? { ...section, image } : section;
        }),
      },
    });
  }

  return [...combined.values()].sort(
    (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
  );
}

export async function getArticle(
  slug: string,
  options: Readonly<{ draft?: boolean }> = {},
): Promise<Article | null> {
  if (options.draft && draftSanity) {
    const remote = await draftSanity.fetch(draftArticleQuery, { slug });
    if (remote) return normalizeArticle(remote);
  }

  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}
