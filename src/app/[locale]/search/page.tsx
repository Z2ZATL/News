import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SearchIndex } from "@/components/search-index";
import { getArticles, getProjects } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: ui[locale].search,
    description:
      locale === "th"
        ? "ค้นหาข่าว บทวิเคราะห์ และโครงการที่เผยแพร่บน Z2Zs Lab"
        : "Search stories, analysis, and projects published by Z2Zs Lab.",
    alternates: localizedAlternates(locale, "/search"),
  };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">INDEX / SEARCH</p>
      <h1 className="page-title">{ui[locale].search}</h1>
      <SearchIndex articles={await getArticles()} locale={locale} projects={await getProjects()} />
    </div>
  );
}
