import { getArticles } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function createRss(locale: Locale): Promise<Response> {
  const site = SITE_URL;
  const articles = await getArticles();
  const items = articles
    .map(
      (article) => `<item>
  <title>${xml(article.title[locale])}</title>
  <link>${site}/${locale}/stories/${xml(article.slug)}</link>
  <guid isPermaLink="true">${site}/${locale}/stories/${xml(article.slug)}</guid>
  <description>${xml(article.excerpt[locale])}</description>
  <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");
  const title = locale === "th" ? "Z2Zs Lab — ข่าวและบทวิเคราะห์" : "Z2Zs Lab — Stories";
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${xml(title)}</title>
<link>${site}/${locale}</link>
<description>${xml("Technology reporting, analysis, and experiments from Bangkok.")}</description>
<language>${locale}</language>
${items}
</channel></rss>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
