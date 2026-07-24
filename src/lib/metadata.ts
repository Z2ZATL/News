import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n";

export function localizedAlternates(
  locale: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      th: `/th${path}`,
      en: `/en${path}`,
      "x-default": `/th${path}`,
    },
  };
}
