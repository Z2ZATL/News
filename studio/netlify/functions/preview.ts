import { createPreviewResponse } from "../../src/preview-broker";

export default async function preview(request: Request): Promise<Response> {
  return createPreviewResponse(request, {
    newsOrigin: process.env.NEWS_PREVIEW_ORIGIN,
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    secret: process.env.PREVIEW_TICKET_SECRET,
  });
}
