import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { BilingualPublishAction } from "./src/actions/bilingual-publish";
import { schemaTypes } from "./src/schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");

export default defineConfig({
  name: "z2zs-labs",
  title: "Z2Zs Labs",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  basePath: "/",
  plugins: [structureTool(), visionTool({ defaultApiVersion: "2025-01-01" })],
  schema: { types: schemaTypes },
  document: {
    actions: (previous, context) =>
      context.schemaType === "article"
        ? previous.map((action) => (action.action === "publish" ? BilingualPublishAction : action))
        : previous,
    productionUrl: async (previous, context) => {
      const slug = context.document.slug as { current?: string } | undefined;
      const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET;
      const origin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN;
      if (!slug?.current || !secret || !origin) return previous;
      const url = new URL("/api/draft", origin);
      url.searchParams.set("secret", secret);
      url.searchParams.set("slug", slug.current);
      url.searchParams.set("locale", "th");
      return url.toString();
    },
  },
});
