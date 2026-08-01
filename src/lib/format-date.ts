import type { Locale } from "@/lib/i18n";

export function formatArticleDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH-u-ca-gregory" : "en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}
