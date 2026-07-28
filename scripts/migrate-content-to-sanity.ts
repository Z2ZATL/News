import { createClient } from "@sanity/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

import type { ArticleBody, ArticleImageBlock, LocalizedText } from "../src/lib/content-types";
import { fixtureArticles, fixtureProjects, fixtureSettings } from "../src/lib/fixture-content";

const apply = process.argv.includes("--apply");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_MIGRATION_TOKEN;

function idPart(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function localized(type: "localizedString" | "localizedText", value: LocalizedText) {
  return { _type: type, ...value };
}

function localAssetPath(source: string): string {
  if (!source.startsWith("/images/") || source.includes("..")) {
    throw new Error(`Migration only accepts local /images assets: ${source}`);
  }
  return join(process.cwd(), "public", ...source.split("/").filter(Boolean));
}

function imageContentType(path: string): string {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported migration image extension: ${extension}`);
}

function isArticleImageBlock(
  block: ArticleBody[number],
): block is ArticleImageBlock {
  return block._type === "articleImage" && "src" in block;
}

async function main(): Promise<void> {
  const localImages = new Set<string>();
  for (const article of fixtureArticles) {
    localImages.add(article.cover.src);
    for (const block of [...article.body.th, ...article.body.en]) {
      if (isArticleImageBlock(block)) localImages.add(block.src);
    }
  }
  for (const project of fixtureProjects) {
    for (const block of [...project.body.th, ...project.body.en]) {
      if (isArticleImageBlock(block)) localImages.add(block.src);
    }
  }
  await Promise.all([...localImages].map((source) => readFile(localAssetPath(source))));

  const summary = {
    articles: fixtureArticles.length,
    assets: localImages.size,
    authors: new Set(fixtureArticles.map((article) => article.author.name)).size,
    categories: new Set(fixtureArticles.map((article) => article.category.en)).size,
    projects: fixtureProjects.length,
    settings: 1,
    dataset,
    projectId: projectId ?? "not configured",
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!apply) {
    console.log("Dry run complete. Re-run with --apply after reviewing the summary.");
    return;
  }
  if (!projectId || !token) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_MIGRATION_TOKEN are required");
  }

  const client = createClient({
    apiVersion: "2025-01-01",
    dataset,
    projectId,
    token,
    useCdn: false,
  });
  const existing = await client.fetch<unknown[]>(
    `*[_type in ["article", "author", "category", "project", "settings"]]`,
  );
  const backupDirectory = join(process.cwd(), ".migration-backups");
  await mkdir(backupDirectory, { recursive: true });
  const backupPath = join(backupDirectory, `content-${new Date().toISOString().replaceAll(":", "-")}.json`);
  await writeFile(backupPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

  const assetReferences = new Map<string, string>();
  for (const source of localImages) {
    const path = localAssetPath(source);
    const asset = await client.assets.upload("image", await readFile(path), {
      contentType: imageContentType(path),
      filename: basename(path),
    });
    assetReferences.set(source, asset._id);
  }

  const imageReference = (source: string) => {
    const reference = assetReferences.get(source);
    if (!reference) throw new Error(`Missing uploaded asset for ${source}`);
    return { _ref: reference, _type: "reference" };
  };
  const portableBody = (body: ArticleBody) =>
    body.map((block) => {
      if (!isArticleImageBlock(block)) return block;
      const image = block;
      return {
        _key: image._key,
        _type: "articleImage",
        alt: image.alt,
        asset: imageReference(image.src),
        caption: image.caption,
      };
    });

  let transaction = client.transaction();
  for (const article of fixtureArticles) {
    const authorId = `author-${idPart(article.author.name)}`;
    const categoryId = `category-${idPart(article.category.en)}`;
    transaction = transaction.createOrReplace({
      _id: authorId,
      _type: "author",
      name: article.author.name,
      role: localized("localizedString", article.author.role),
    });
    transaction = transaction.createOrReplace({
      _id: categoryId,
      _type: "category",
      slug: { _type: "slug", current: idPart(article.category.en) },
      title: localized("localizedString", article.category),
    });
    transaction = transaction.createOrReplace({
      _id: `article-${article.slug}`,
      _type: "article",
      atlasLocation: {
        _type: "object",
        ...article.atlasLocation,
        label: localized("localizedString", article.atlasLocation.label),
      },
      author: { _ref: authorId, _type: "reference" },
      body: {
        _type: "localizedBody",
        en: portableBody(article.body.en),
        th: portableBody(article.body.th),
      },
      category: { _ref: categoryId, _type: "reference" },
      cover: {
        _type: "image",
        alt: localized("localizedString", article.cover.alt),
        asset: imageReference(article.cover.src),
        ...(article.cover.caption
          ? { caption: localized("localizedString", article.cover.caption) }
          : {}),
      },
      excerpt: localized("localizedText", article.excerpt),
      featured: article.featured,
      publishedAt: article.publishedAt,
      seo: {
        _type: "object",
        metaDesc: localized("localizedText", article.excerpt),
        metaTitle: localized("localizedString", article.title),
        ogImage: {
          _type: "image",
          asset: imageReference(article.cover.src),
        },
      },
      slug: { _type: "slug", current: article.slug },
      sources: article.sources.map((source, index) => ({
        _key: `source-${String(index)}`,
        _type: "object",
        label: localized("localizedString", source.label),
        url: source.url,
      })),
      status: "published",
      tags: article.tags,
      title: localized("localizedString", article.title),
      updatedAt: article.updatedAt,
      ...(article.video ? { video: { _type: "object", ...article.video } } : {}),
    });
  }
  for (const project of fixtureProjects) {
    transaction = transaction.createOrReplace({
      _id: `project-${project.slug}`,
      _type: "project",
      body: {
        _type: "localizedBody",
        en: portableBody(project.body.en),
        th: portableBody(project.body.th),
      },
      links: project.links,
      promoted: project.promoted,
      slug: { _type: "slug", current: project.slug },
      status: "published",
      summary: localized("localizedText", project.summary),
      title: localized("localizedString", project.title),
    });
  }
  transaction = transaction.createOrReplace({
    _id: "settings",
    _type: "settings",
    footer: localized("localizedText", fixtureSettings.footer),
    siteTitle: localized("localizedString", fixtureSettings.siteTitle),
    socialLinks: fixtureSettings.socialLinks,
  });
  await transaction.commit({ visibility: "sync" });

  const count = await client.fetch<number>(
    `count(*[_type == "article" && status == "published" && slug.current in $slugs])`,
    { slugs: fixtureArticles.map((article) => article.slug) },
  );
  if (count !== fixtureArticles.length) {
    throw new Error(`Migration verification failed: expected ${String(fixtureArticles.length)}, got ${String(count)}`);
  }
  const projectCount = await client.fetch<number>(
    `count(*[_type == "project" && status == "published" && slug.current in $slugs])`,
    { slugs: fixtureProjects.map((project) => project.slug) },
  );
  if (projectCount !== fixtureProjects.length) {
    throw new Error(`Project migration verification failed: expected ${String(fixtureProjects.length)}, got ${String(projectCount)}`);
  }
  const hasSettings = await client.fetch<boolean>(`defined(*[_id == "settings"][0])`);
  if (!hasSettings) throw new Error("Settings migration verification failed");
  console.log(`Migration complete. Backup: ${backupPath}`);
}

await main();
