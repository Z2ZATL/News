import type { MetadataRoute } from "next";

import { getArticles } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://news.z2zs.space";
  const fixed = [
    "",
    "/stories",
    "/projects",
    "/projects/lumixia-brief",
    "/about",
    "/privacy",
    "/terms",
    "/search",
  ];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ["th", "en"] as const) {
    for (const path of fixed) {
      entries.push({
        url: `${site}/${locale}${path}`,
        alternates: { languages: { th: `${site}/th${path}`, en: `${site}/en${path}` } },
      });
    }
  }
  for (const article of await getArticles()) {
    for (const locale of ["th", "en"] as const) {
      entries.push({
        url: `${site}/${locale}/stories/${article.slug}`,
        lastModified: article.updatedAt,
        alternates: {
          languages: {
            th: `${site}/th/stories/${article.slug}`,
            en: `${site}/en/stories/${article.slug}`,
          },
        },
      });
    }
  }
  return entries;
}
