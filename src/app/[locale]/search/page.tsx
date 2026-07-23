import { notFound } from "next/navigation";

import { SearchIndex } from "@/components/search-index";
import { getArticles } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">INDEX / SEARCH</p>
      <h1 className="page-title">{ui[locale].search}</h1>
      <SearchIndex articles={await getArticles()} locale={locale} />
    </div>
  );
}
