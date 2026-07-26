import { createPreviewResponse } from "../../src/preview-broker";

export default function preview(request: Request): Response {
  return createPreviewResponse(request, {
    secret: process.env.PREVIEW_TICKET_SECRET,
    newsOrigin: process.env.NEWS_PREVIEW_ORIGIN,
  });
}
