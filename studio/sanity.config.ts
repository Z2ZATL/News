import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { BilingualPublishAction } from "./src/actions/bilingual-publish";
import { isAllowedPreviewBrokerOrigin } from "./src/preview-origin";
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
    productionUrl: async (previous, context) => {
      const slug = context.document.slug as { current?: string } | undefined;
      const currentOrigin =
        typeof window === "undefined" ? undefined : window.location.origin;
      const origin = process.env.SANITY_STUDIO_PREVIEW_BROKER_ORIGIN ?? currentOrigin;
      if (
        !slug?.current ||
        !currentOrigin ||
        !origin ||
        !isAllowedPreviewBrokerOrigin(origin, currentOrigin)
      ) {
        return previous;
      }
      const token = context.getClient({ apiVersion: "2025-01-01" }).config().token;
      if (!token) return previous;
      const url = new URL("/api/preview", origin);
      try {
        const response = await fetch(url, {
          body: JSON.stringify({
            documentType: context.document._type,
            locale: "th",
            slug: slug.current,
          }),
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        if (!response.ok) return previous;
        const result = (await response.json()) as unknown;
        if (typeof result !== "object" || result === null) return previous;
        const previewUrl = (result as { url?: unknown }).url;
        if (typeof previewUrl !== "string") return previous;
        const destination = new URL(previewUrl);
        const expectedOrigin = process.env.SANITY_STUDIO_NEWS_ORIGIN;
        if (
          !expectedOrigin ||
          destination.origin !== expectedOrigin ||
          destination.pathname !== "/api/draft" ||
          !destination.searchParams.has("ticket")
        ) {
          return previous;
        }
        return destination.toString();
      } catch {
        return previous;
      }
    },
  },
});
