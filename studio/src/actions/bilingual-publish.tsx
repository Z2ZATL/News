import type { DocumentActionComponent, SanityDocument } from "sanity";
import { useDocumentOperation } from "sanity";

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isBilingual(document: SanityDocument | null): boolean {
  if (!document) return false;
  const title = document.title as { th?: unknown; en?: unknown } | undefined;
  const excerpt = document.excerpt as { th?: unknown; en?: unknown } | undefined;
  const body = document.body as { th?: unknown[]; en?: unknown[] } | undefined;
  const cover = document.cover as { alt?: { th?: unknown; en?: unknown } } | undefined;
  const atlasLocation = document.atlasLocation as
    | { latitude?: unknown; longitude?: unknown; label?: { th?: unknown; en?: unknown } }
    | undefined;
  return Boolean(
    hasText(title?.th) &&
      hasText(title?.en) &&
      hasText(excerpt?.th) &&
      hasText(excerpt?.en) &&
      body?.th?.length &&
      body.en?.length &&
      hasText(cover?.alt?.th) &&
      hasText(cover?.alt?.en) &&
      typeof atlasLocation?.latitude === "number" &&
      typeof atlasLocation.longitude === "number" &&
      hasText(atlasLocation.label?.th) &&
      hasText(atlasLocation.label?.en),
  );
}

export const BilingualPublishAction: DocumentActionComponent = (props) => {
  const { publish } = useDocumentOperation(props.id, props.type);
  const ready = isBilingual(props.draft ?? props.published);
  return {
    label: "Publish",
    disabled: Boolean(publish.disabled) || !ready,
    title: ready
      ? undefined
      : "Complete bilingual copy, cover alt text, and a valid Atlas location before publishing.",
    onHandle: () => {
      publish.execute();
    },
  };
};
