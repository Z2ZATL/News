import type { DocumentActionComponent, SanityDocument } from "sanity";
import { useDocumentOperation } from "sanity";

import { hasCompleteSeoOverride, hasText } from "../../../shared/editorial-rules";

function isArticleReady(document: SanityDocument | null): boolean {
  if (!document) return false;
  const title = document.title as { th?: unknown; en?: unknown } | undefined;
  const excerpt = document.excerpt as { th?: unknown; en?: unknown } | undefined;
  const body = document.body as { th?: unknown[]; en?: unknown[] } | undefined;
  const cover = document.cover as { alt?: { th?: unknown; en?: unknown } } | undefined;
  const seo = document.seo;
  const slug = document.slug as { current?: unknown } | undefined;
  const atlasLocation = document.atlasLocation as
    | { countryCode?: unknown; latitude?: unknown; longitude?: unknown; label?: { th?: unknown; en?: unknown } }
    | undefined;
  return Boolean(
    hasText(title?.th) &&
      hasText(title?.en) &&
      typeof slug?.current === "string" &&
      /^[a-z0-9-]{1,120}$/.test(slug.current) &&
      hasText(excerpt?.th) &&
      hasText(excerpt?.en) &&
      body?.th?.length &&
      body.en?.length &&
      hasText(cover?.alt?.th) &&
      hasText(cover?.alt?.en) &&
      typeof atlasLocation?.countryCode === "string" &&
      /^[A-Z]{2}$/.test(atlasLocation.countryCode) &&
      typeof atlasLocation.latitude === "number" &&
      typeof atlasLocation.longitude === "number" &&
      hasText(atlasLocation.label?.th) &&
      hasText(atlasLocation.label?.en) &&
      hasCompleteSeoOverride(seo),
  );
}

function isProjectReady(document: SanityDocument | null): boolean {
  if (!document) return false;
  const title = document.title as { th?: unknown; en?: unknown } | undefined;
  const summary = document.summary as { th?: unknown; en?: unknown } | undefined;
  const body = document.body as { th?: unknown[]; en?: unknown[] } | undefined;
  const slug = document.slug as { current?: unknown } | undefined;
  return Boolean(
    hasText(title?.th) &&
      hasText(title?.en) &&
      hasText(summary?.th) &&
      hasText(summary?.en) &&
      body?.th?.length &&
      body.en?.length &&
      typeof slug?.current === "string" &&
      /^[a-z0-9-]{1,120}$/.test(slug.current),
  );
}

function isSettingsReady(document: SanityDocument | null): boolean {
  if (!document) return false;
  const siteTitle = document.siteTitle as { th?: unknown; en?: unknown } | undefined;
  const footer = document.footer as { th?: unknown; en?: unknown } | undefined;
  const socialLinks = document.socialLinks as unknown[] | undefined;
  return Boolean(
    hasText(siteTitle?.th) &&
      hasText(siteTitle?.en) &&
      hasText(footer?.th) &&
      hasText(footer?.en) &&
      socialLinks?.length &&
      socialLinks.every((value) => typeof value === "string" && value.startsWith("https://")),
  );
}

export const BilingualPublishAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const document = props.draft ?? props.published;
  const ready = props.type === "article"
    ? isArticleReady(document)
    : props.type === "project"
      ? isProjectReady(document)
      : isSettingsReady(document);
  return {
    label: "Publish",
    disabled: Boolean(publish.disabled) || !ready,
    title: ready
      ? undefined
      : "Complete every required bilingual field before publishing.",
    onHandle: () => {
      const now = new Date().toISOString();
      if (props.type === "article") {
        patch.execute([
          { set: { status: "published", updatedAt: now } },
          { setIfMissing: { publishedAt: now } },
        ]);
      } else if (props.type === "project") {
        patch.execute([{ set: { status: "published" } }]);
      }
      publish.execute();
    },
  };
};
