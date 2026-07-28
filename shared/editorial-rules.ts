export const ARTICLE_EXCERPT_MAX_LENGTH = 200;
export const ARTICLE_META_DESCRIPTION_MAX_LENGTH = 200;
export const ARTICLE_META_TITLE_MAX_LENGTH = 70;

interface LocalizedUnknown {
  readonly en?: unknown;
  readonly th?: unknown;
}

interface SeoOverrideUnknown {
  readonly metaDesc?: LocalizedUnknown;
  readonly metaTitle?: LocalizedUnknown;
}

export function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasCompleteLocalizedText(value: LocalizedUnknown | undefined): boolean {
  return value !== undefined && hasText(value.th) && hasText(value.en);
}

export function hasCompleteSeoOverride(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "object") return false;
  const seo = value as SeoOverrideUnknown;
  return hasCompleteLocalizedText(seo.metaTitle) && hasCompleteLocalizedText(seo.metaDesc);
}
