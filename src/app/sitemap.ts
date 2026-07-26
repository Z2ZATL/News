import type { MetadataRoute } from "next";

import { getArticles, getProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = SITE_URL;
  const fixed = [
    "",
    "/stories",
    "/projects",
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
        alternates: {
          languages: {
            th: `${site}/th${path}`,
            en: `${site}/en${path}`,
            "x-default": `${site}/th${path}`,
          },
        },
      });
    }
  }
  for (const project of await getProjects()) {
    for (const locale of ["th", "en"] as const) {
      entries.push({
        url: `${site}/${locale}/projects/${project.slug}`,
        alternates: {
          languages: {
            th: `${site}/th/projects/${project.slug}`,
            en: `${site}/en/projects/${project.slug}`,
            "x-default": `${site}/th/projects/${project.slug}`,
          },
        },
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
            "x-default": `${site}/th/stories/${article.slug}`,
          },
        },
      });
    }
  }
  return entries;
}
