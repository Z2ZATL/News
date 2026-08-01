import "server-only";

import { createClient } from "@sanity/client";
import { defineQuery } from "groq";
import { z } from "zod";

import type { Article, Project, SiteSettings } from "@/lib/content-types";
import { isProductionDeployment } from "@/lib/deployment";
import { fixtureArticles, fixtureProjects, fixtureSettings } from "@/lib/fixture-content";
import {
  ARTICLE_EXCERPT_MAX_LENGTH,
  ARTICLE_META_DESCRIPTION_MAX_LENGTH,
  ARTICLE_META_TITLE_MAX_LENGTH,
} from "../../shared/editorial-rules";

const slugSchema = z.string().regex(/^[a-z0-9-]{1,120}$/);
const localizedSchema = z
  .object({
    en: z.string().trim().min(1).max(10_000),
    th: z.string().trim().min(1).max(10_000),
  })
  .strict();
const excerptSchema = localizedSchema.refine(
  (value) =>
    value.th.length <= ARTICLE_EXCERPT_MAX_LENGTH &&
    value.en.length <= ARTICLE_EXCERPT_MAX_LENGTH,
  `Each excerpt must be ${String(ARTICLE_EXCERPT_MAX_LENGTH)} characters or fewer`,
);
const metaTitleSchema = localizedSchema.refine(
  (value) =>
    value.th.length <= ARTICLE_META_TITLE_MAX_LENGTH &&
    value.en.length <= ARTICLE_META_TITLE_MAX_LENGTH,
  `Each meta title must be ${String(ARTICLE_META_TITLE_MAX_LENGTH)} characters or fewer`,
);
const metaDescriptionSchema = localizedSchema.refine(
  (value) =>
    value.th.length <= ARTICLE_META_DESCRIPTION_MAX_LENGTH &&
    value.en.length <= ARTICLE_META_DESCRIPTION_MAX_LENGTH,
  `Each meta description must be ${String(ARTICLE_META_DESCRIPTION_MAX_LENGTH)} characters or fewer`,
);
const httpsUrlSchema = z.url().refine((value) => new URL(value).protocol === "https:");
const sanityImageUrlSchema = httpsUrlSchema.refine(
  (value) => new URL(value).hostname === "cdn.sanity.io",
);
const safeLinkSchema = z.string().max(2_048).refine((value) => {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "mailto:";
  } catch {
    return false;
  }
});
const markDefinitionSchema = z
  .object({
    _key: z.string().min(1).max(128),
    _type: z.literal("link"),
    href: safeLinkSchema,
  })
  .strict();
const spanSchema = z
  .object({
    _key: z.string().min(1).max(128),
    _type: z.literal("span"),
    marks: z.array(z.string().max(128)).max(20).default([]),
    text: z.string().max(50_000),
  })
  .strict();
const portableBlockSchema = z
  .object({
    _key: z.string().min(1).max(128),
    _type: z.literal("block"),
    children: z.array(spanSchema).min(1).max(500),
    level: z.number().int().min(1).max(10).optional(),
    listItem: z.enum(["bullet", "number"]).optional(),
    markDefs: z.array(markDefinitionSchema).max(100).default([]),
    style: z
      .enum(["normal", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"])
      .default("normal"),
  })
  .strict()
  .transform((value) => ({
    _key: value._key,
    _type: value._type,
    children: value.children,
    markDefs: value.markDefs,
    style: value.style,
    ...(value.level === undefined ? {} : { level: value.level }),
    ...(value.listItem === undefined ? {} : { listItem: value.listItem }),
  }));
const articleImageSchema = z
  .object({
    _key: z.string().min(1).max(128),
    _type: z.literal("articleImage"),
    alt: z.string().trim().min(1).max(1_000),
    caption: z.string().trim().max(2_000),
    height: z.number().int().positive().max(20_000),
    src: sanityImageUrlSchema,
    width: z.number().int().positive().max(20_000),
  })
  .strict();
const bodySchema = z.array(z.union([portableBlockSchema, articleImageSchema])).min(1).max(1_000);
type ValidatedBody = z.infer<typeof bodySchema>;

function estimateThaiReadingMinutes(body: ValidatedBody): number {
  const characters = body.reduce((total, block) => {
    if (block._type !== "block") return total;
    return total + block.children.reduce((sum, child) => sum + child.text.replace(/\s/g, "").length, 0);
  }, 0);
  return Math.max(1, Math.min(120, Math.ceil(characters / 500)));
}

const articleSchema = z
  .object({
    atlasLocation: z
      .object({
        countryCode: z.string().regex(/^[A-Z]{2}$/),
        label: localizedSchema,
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .strict(),
    author: z
      .object({
        name: z.string().trim().min(1).max(200),
        role: localizedSchema,
      })
      .strict(),
    body: z.object({ en: bodySchema, th: bodySchema }).strict(),
    category: localizedSchema,
    cover: z
      .object({
        alt: localizedSchema,
        caption: localizedSchema.nullable().optional(),
        height: z.number().int().positive().max(20_000),
        src: sanityImageUrlSchema,
        width: z.number().int().positive().max(20_000),
      })
      .strict(),
    excerpt: excerptSchema,
    featured: z.boolean().default(false),
    publishedAt: z.iso.datetime(),
    slug: slugSchema,
    sources: z
      .array(z.object({ label: localizedSchema, url: httpsUrlSchema }).strict())
      .max(50),
    tags: z.array(z.string().trim().min(1).max(100)).max(30),
    title: localizedSchema,
    updatedAt: z.iso.datetime(),
    seo: z
      .object({
        metaDesc: metaDescriptionSchema,
        metaTitle: metaTitleSchema,
        ogImage: z
          .object({
            height: z.number().int().positive().max(20_000),
            src: sanityImageUrlSchema,
            width: z.number().int().positive().max(20_000),
          })
          .strict()
          .nullable()
          .optional(),
      })
      .strict()
      .nullable()
      .optional(),
    video: z
      .object({
        embedUrl: httpsUrlSchema.refine(
          (value) => new URL(value).hostname === "player.vimeo.com",
        ),
        sourceUrl: httpsUrlSchema,
        title: localizedSchema,
      })
      .strict()
      .optional(),
  })
  .strict()
  .transform(({ seo, video, ...value }) => {
    const { caption, ...coverFields } = value.cover;
    const cover = {
      ...coverFields,
      ...(caption == null ? {} : { caption }),
    };
    const normalizedSeo =
      seo == null
        ? undefined
        : (() => {
            const { ogImage, ...fields } = seo;
            return { ...fields, ...(ogImage == null ? {} : { ogImage }) };
          })();
    return {
      ...value,
      cover,
      readingMinutes: estimateThaiReadingMinutes(value.body.th),
      ...(normalizedSeo === undefined ? {} : { seo: normalizedSeo }),
      ...(video === undefined ? {} : { video }),
    };
  });

const projectSchema = z
  .object({
    body: z.object({ en: bodySchema, th: bodySchema }).strict(),
    links: z.array(httpsUrlSchema).max(20),
    promoted: z.boolean().default(false),
    slug: slugSchema,
    summary: localizedSchema,
    title: localizedSchema,
  })
  .strict();
const settingsSchema = z
  .object({
    footer: localizedSchema,
    siteTitle: localizedSchema,
    socialLinks: z.array(httpsUrlSchema).max(20),
  })
  .strict();

const articleProjection = `{
  "slug": slug.current,
  "title": {"th": title.th, "en": title.en},
  "excerpt": {"th": excerpt.th, "en": excerpt.en},
  "seo": select(
    defined(seo) => {
      "metaTitle": {"th": seo.metaTitle.th, "en": seo.metaTitle.en},
      "metaDesc": {"th": seo.metaDesc.th, "en": seo.metaDesc.en},
      "ogImage": select(
        defined(seo.ogImage.asset) => {
          "src": seo.ogImage.asset->url,
          "width": seo.ogImage.asset->metadata.dimensions.width,
          "height": seo.ogImage.asset->metadata.dimensions.height
        },
        null
      )
    },
    null
  ),
  "cover": {
    "src": cover.asset->url,
    "width": cover.asset->metadata.dimensions.width,
    "height": cover.asset->metadata.dimensions.height,
    "alt": {"th": cover.alt.th, "en": cover.alt.en},
    "caption": select(
      defined(cover.caption) => {"th": cover.caption.th, "en": cover.caption.en},
      null
    )
  },
  "category": {"th": category->title.th, "en": category->title.en},
  "author": {
    "name": author->name,
    "role": {"th": author->role.th, "en": author->role.en}
  },
  "atlasLocation": {
    "countryCode": atlasLocation.countryCode,
    "latitude": atlasLocation.latitude,
    "longitude": atlasLocation.longitude,
    "label": {"th": atlasLocation.label.th, "en": atlasLocation.label.en}
  },
  "body": {
    "th": body.th[]{
      _type == "block" => {
        _key, _type,
        children[]{_key, _type, marks, text},
        defined(level) => {level},
        defined(listItem) => {listItem},
        markDefs[]{_key, _type, href},
        style
      },
      _type == "articleImage" => {
        _key, _type, alt, caption,
        "src": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      }
    },
    "en": body.en[]{
      _type == "block" => {
        _key, _type,
        children[]{_key, _type, marks, text},
        defined(level) => {level},
        defined(listItem) => {listItem},
        markDefs[]{_key, _type, href},
        style
      },
      _type == "articleImage" => {
        _key, _type, alt, caption,
        "src": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      }
    }
  },
  defined(video) => {
    "video": {
      "embedUrl": video.embedUrl,
      "sourceUrl": video.sourceUrl,
      "title": {"th": video.title.th, "en": video.title.en}
    }
  },
  tags,
  "sources": sources[]{
    "label": {"th": label.th, "en": label.en},
    url
  },
  featured,
  publishedAt,
  updatedAt
}`;

const articleQuery = defineQuery(
  `*[_type == "article" && status == "published"] | order(publishedAt desc) ${articleProjection}`,
);
const draftArticleQuery = defineQuery(
  `*[_type == "article" && slug.current == $slug][0] ${articleProjection}`,
);
const projectQuery = defineQuery(
  `*[_type == "project" && status == "published"] | order(promoted desc, title.en asc) {
    "slug": slug.current,
    "title": {"th": title.th, "en": title.en},
    "summary": {"th": summary.th, "en": summary.en},
    promoted, links,
    "body": {
      "th": body.th[]{
        _type == "block" => {
          _key, _type,
          children[]{_key, _type, marks, text},
          defined(level) => {level},
          defined(listItem) => {listItem},
          markDefs[]{_key, _type, href},
          style
        },
        _type == "articleImage" => {
          _key, _type, alt, caption,
          "src": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      },
      "en": body.en[]{
        _type == "block" => {
          _key, _type,
          children[]{_key, _type, marks, text},
          defined(level) => {level},
          defined(listItem) => {listItem},
          markDefs[]{_key, _type, href},
          style
        },
        _type == "articleImage" => {
          _key, _type, alt, caption,
          "src": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    }
  }`,
);
const settingsQuery = defineQuery(
  `*[_type == "settings" && _id == "settings"][0] {
    "siteTitle": {"th": siteTitle.th, "en": siteTitle.en},
    "footer": {"th": footer.th, "en": footer.en},
    socialLinks
  }`,
);
const draftProjectQuery = defineQuery(
  `*[_type == "project" && slug.current == $slug][0] {
    "slug": slug.current,
    "title": {"th": title.th, "en": title.en},
    "summary": {"th": summary.th, "en": summary.en},
    promoted, links,
    "body": {
      "th": body.th[]{
        _type == "block" => {
          _key, _type,
          children[]{_key, _type, marks, text},
          defined(level) => {level},
          defined(listItem) => {listItem},
          markDefs[]{_key, _type, href},
          style
        },
        _type == "articleImage" => {
          _key, _type, alt, caption,
          "src": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      },
      "en": body.en[]{
        _type == "block" => {
          _key, _type,
          children[]{_key, _type, marks, text},
          defined(level) => {level},
          defined(listItem) => {listItem},
          markDefs[]{_key, _type, href},
          style
        },
        _type == "articleImage" => {
          _key, _type, alt, caption,
          "src": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    }
  }`,
);

type ContentMode = "fixture" | "sanity";

function contentMode(): ContentMode {
  const configured = process.env.CONTENT_SOURCE;
  if (configured === "fixture" || configured === "sanity") return configured;
  return isProductionDeployment() ? "sanity" : "fixture";
}

function sanityProjectConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    throw new Error("Sanity content source is not configured");
  }
  return {
    apiVersion: "2025-01-01",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    projectId,
  } as const;
}

function publishedSanityClient() {
  return createClient({
    ...sanityProjectConfig(),
    perspective: "published",
    useCdn: true,
  });
}

function draftSanityClient() {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) throw new Error("Sanity draft preview is not configured");
  const shared = sanityProjectConfig();
  return {
    client: createClient({ ...shared, perspective: "drafts", token, useCdn: false }),
  }.client;
}

function validateArticle(value: unknown): Article | null {
  const parsed = articleSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  const slug =
    value && typeof value === "object" && "slug" in value && typeof value.slug === "string"
      ? value.slug
      : "unknown";
  console.error("content_validation_failed", {
    issues: parsed.error.issues.map((issue) => ({ code: issue.code, path: issue.path.join(".") })),
    slug,
  });
  return null;
}

function sorted(articles: readonly Article[]): Article[] {
  return [...articles].sort(
    (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
  );
}

export async function getArticles(): Promise<Article[]> {
  if (contentMode() === "fixture") return sorted(fixtureArticles);
  const published = publishedSanityClient();
  const values = await published.fetch<unknown[]>(articleQuery, {}, {
    next: { tags: ["article", "author", "category"] },
  });
  return sorted(values.flatMap((value) => {
    const article = validateArticle(value);
    return article ? [article] : [];
  }));
}

export async function getArticle(
  slug: string,
  options: Readonly<{ draft?: boolean }> = {},
): Promise<Article | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  if (contentMode() === "fixture") {
    return fixtureArticles.find((article) => article.slug === slug) ?? null;
  }
  if (options.draft) {
    return validateArticle(await draftSanityClient().fetch<unknown>(draftArticleQuery, { slug }));
  }
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getProjects(): Promise<Project[]> {
  if (contentMode() === "fixture") return fixtureProjects;
  const published = publishedSanityClient();
  const values = await published.fetch<unknown[]>(projectQuery, {}, {
    next: { tags: ["project"] },
  });
  return values.flatMap((value) => {
    const parsed = projectSchema.safeParse(value);
    if (parsed.success) return [parsed.data];
    console.error("project_validation_failed", {
      issues: parsed.error.issues.map((issue) => ({ code: issue.code, path: issue.path.join(".") })),
    });
    return [];
  });
}

export async function getProject(
  slug: string,
  options: Readonly<{ draft?: boolean }> = {},
): Promise<Project | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  if (contentMode() === "sanity" && options.draft) {
    const parsed = projectSchema.safeParse(
      await draftSanityClient().fetch<unknown>(draftProjectQuery, { slug }),
    );
    if (parsed.success) return parsed.data;
    return null;
  }
  return (await getProjects()).find((project) => project.slug === slug) ?? null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (contentMode() === "fixture") return fixtureSettings;
  const published = publishedSanityClient();
  const value = await published.fetch<unknown>(settingsQuery, {}, {
    next: { tags: ["settings"] },
  });
  const parsed = settingsSchema.safeParse(value);
  if (!parsed.success) {
    console.error("settings_validation_failed", {
      issues: parsed.error.issues.map((issue) => ({ code: issue.code, path: issue.path.join(".") })),
    });
    throw new Error("Published site settings are invalid or missing");
  }
  return parsed.data;
}
