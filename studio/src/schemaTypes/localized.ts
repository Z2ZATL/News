import { defineArrayMember, defineField } from "sanity";

export const localizedString = defineField({
  name: "localizedString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "th", title: "ไทย", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
});

export const localizedText = defineField({
  name: "localizedText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "th", title: "ไทย", type: "text", rows: 3 }),
    defineField({ name: "en", title: "English", type: "text", rows: 3 }),
  ],
});

const blocks = [
  defineArrayMember({
    type: "block",
    marks: {
      annotations: [
        {
          name: "link",
          title: "Link",
          type: "object",
          fields: [
            defineField({
              name: "href",
              type: "url",
              validation: (rule) =>
                rule.uri({ scheme: ["https", "mailto"], allowRelative: true }),
            }),
          ],
        },
      ],
    },
  }),
  defineArrayMember({
    name: "articleImage",
    title: "Article image",
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        validation: (rule) => rule.required().max(1_000),
      }),
      defineField({ name: "caption", type: "string", validation: (rule) => rule.max(2_000) }),
    ],
  }),
];

export const localizedBody = defineField({
  name: "localizedBody",
  title: "Localized body",
  type: "object",
  fields: [
    defineField({ name: "th", title: "ไทย", type: "array", of: blocks }),
    defineField({ name: "en", title: "English", type: "array", of: blocks }),
  ],
});
