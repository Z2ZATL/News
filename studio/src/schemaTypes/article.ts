import { defineArrayMember, defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title.en", maxLength: 120 },
      validation: (rule) =>
        rule.required().custom((value) =>
          value?.current && /^[a-z0-9-]{1,120}$/.test(value.current)
            ? true
            : "Use 1–120 lowercase Latin letters, numbers, and hyphens.",
        ),
    }),
    defineField({ name: "title", type: "localizedString" }),
    defineField({
      name: "excerpt",
      type: "localizedText",
      validation: (rule) =>
        rule.custom((value) => {
          const localized = value as { th?: string; en?: string } | undefined;
          return (localized?.th?.length ?? 0) <= 200 && (localized?.en?.length ?? 0) <= 200
            ? true
            : "Each excerpt must be 200 characters or fewer.";
        }),
    }),
    defineField({ name: "body", type: "localizedBody" }),
    defineField({
      name: "cover",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({ name: "alt", type: "localizedString" }),
        defineField({ name: "caption", type: "localizedString" }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO and social sharing",
      type: "object",
      description:
        "Optional overrides. Leave this empty to use the article title, excerpt, and cover image.",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          const seo = value as {
            metaTitle?: { th?: string; en?: string };
            metaDesc?: { th?: string; en?: string };
          };
          const values = [
            seo.metaTitle?.th,
            seo.metaTitle?.en,
            seo.metaDesc?.th,
            seo.metaDesc?.en,
          ];
          return values.every((entry) => typeof entry === "string" && entry.trim().length > 0)
            ? true
            : "Complete every Thai and English SEO field, or remove this override.";
        }),
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta title",
          type: "localizedString",
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true;
              const localized = value as { th?: string; en?: string };
              return (localized.th?.length ?? 0) <= 70 && (localized.en?.length ?? 0) <= 70
                ? true
                : "Each meta title must be 70 characters or fewer.";
            }),
        }),
        defineField({
          name: "metaDesc",
          title: "Meta description",
          type: "localizedText",
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true;
              const localized = value as { th?: string; en?: string };
              return (localized.th?.length ?? 0) <= 200 && (localized.en?.length ?? 0) <= 200
                ? true
                : "Each meta description must be 200 characters or fewer.";
            }),
        }),
        defineField({
          name: "ogImage",
          title: "Social sharing image",
          type: "image",
          description: "Optional. The cover image is used when this is empty.",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "atlasLocation",
      title: "Atlas location",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "countryCode",
          title: "Country code",
          type: "string",
          description: "ISO 3166-1 alpha-2, for example TH, CN, or US.",
          validation: (rule) =>
            rule.required().regex(/^[A-Z]{2}$/, { name: "two uppercase letters" }),
        }),
        defineField({
          name: "latitude",
          type: "number",
          validation: (rule) => rule.required().min(-90).max(90),
        }),
        defineField({
          name: "longitude",
          type: "number",
          validation: (rule) => rule.required().min(-180).max(180),
        }),
        defineField({ name: "label", type: "localizedString" }),
      ],
    }),
    defineField({ name: "tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({
      name: "video",
      type: "object",
      fields: [
        defineField({
          name: "embedUrl",
          type: "url",
          validation: (rule) =>
            rule.uri({ scheme: ["https"] }).custom((value) => {
              if (!value) return true;
              try {
                return new URL(value).hostname === "player.vimeo.com"
                  ? true
                  : "Only player.vimeo.com embeds are allowed.";
              } catch {
                return "Enter a valid Vimeo embed URL.";
              }
            }),
        }),
        defineField({
          name: "sourceUrl",
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["https"] }),
        }),
        defineField({ name: "title", type: "localizedString" }),
      ],
    }),
    defineField({
      name: "sources",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "localizedString" }),
            defineField({
              name: "url",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "draft",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Review", value: "review" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "publishedAt", type: "datetime", readOnly: true }),
    defineField({ name: "updatedAt", type: "datetime", readOnly: true }),
  ],
  preview: {
    select: { title: "title.th", subtitle: "status", media: "cover" },
  },
});
