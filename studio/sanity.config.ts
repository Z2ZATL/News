import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { BilingualPublishAction } from "./src/actions/bilingual-publish";
import { schemaTypes } from "./src/schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");

export default defineConfig({
  name: "z2zs-lab",
  title: "Z2Zs Lab",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  basePath: "/",
  plugins: [
    structureTool({
      structure: (structure) =>
        structure
          .list()
          .title("Content")
          .items([
            structure
              .listItem()
              .title("Settings")
              .child(structure.document().schemaType("settings").documentId("settings")),
            structure.divider(),
            ...structure.documentTypeListItems().filter((item) => item.getId() !== "settings"),
          ]),
    }),
    visionTool({ defaultApiVersion: "2025-01-01" }),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (previous) => previous.filter((template) => template.templateId !== "settings"),
    actions: (previous, context) =>
      context.schemaType === "article" || context.schemaType === "project" || context.schemaType === "settings"
        ? previous.map((action) => (action.action === "publish" ? BilingualPublishAction : action))
        : previous,
    productionUrl: (previous, context) => {
      const slug = context.document.slug as { current?: string } | undefined;
      const origin = process.env.SANITY_STUDIO_PREVIEW_BROKER_ORIGIN;
      if (!slug?.current || !origin) return Promise.resolve(previous);
      const url = new URL("/api/preview", origin);
      url.searchParams.set("slug", slug.current);
      url.searchParams.set("locale", "th");
      url.searchParams.set("type", context.document._type);
      return Promise.resolve(url.toString());
    },
  },
});
