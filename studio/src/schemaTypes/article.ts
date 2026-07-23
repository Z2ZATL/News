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
      fields: [
        defineField({ name: "alt", type: "localizedString" }),
        defineField({ name: "caption", type: "localizedString" }),
      ],
    }),
    defineField({ name: "category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
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
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "updatedAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "title.th", subtitle: "status", media: "cover" },
  },
});
