import { defineArrayMember, defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (rule) => rule.required() }),
    defineField({ name: "title", type: "localizedString" }),
    defineField({ name: "description", type: "localizedText" }),
    defineField({ name: "accent", type: "string", initialValue: "#2FBFF2" }),
  ],
});

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", type: "localizedString" }),
    defineField({ name: "bio", type: "localizedText" }),
    defineField({ name: "avatar", type: "image", options: { hotspot: true } }),
    defineField({
      name: "socials",
      type: "array",
      of: [defineArrayMember({ type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) })],
    }),
  ],
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (rule) => rule.required() }),
    defineField({ name: "title", type: "localizedString" }),
    defineField({ name: "summary", type: "localizedText" }),
    defineField({ name: "body", type: "localizedBody" }),
    defineField({ name: "assets", type: "array", of: [defineArrayMember({ type: "image" })] }),
    defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "url" })] }),
    defineField({ name: "promoted", type: "boolean", initialValue: false }),
    defineField({ name: "status", type: "string", options: { list: ["draft", "published", "archived"] } }),
  ],
});

export const settings = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "localizedString" }),
    defineField({ name: "defaultOg", type: "image" }),
    defineField({ name: "socialLinks", type: "array", of: [defineArrayMember({ type: "url" })] }),
    defineField({ name: "footer", type: "localizedText" }),
  ],
});
