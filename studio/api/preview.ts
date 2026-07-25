import { createPreviewResponse } from "../src/preview-broker";

interface PreviewRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

interface PreviewResponse {
  end(): void;
  redirect(status: number, location: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): PreviewResponse;
}

function queryValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default function preview(request: PreviewRequest, response: PreviewResponse): void {
  const url = new URL("https://studio.z2zs.space/api/preview");
  for (const [key, value] of Object.entries(request.query)) {
    const normalized = queryValue(value);
    if (normalized) url.searchParams.set(key, normalized);
  }
  const brokerResponse = createPreviewResponse(new Request(url, { method: request.method ?? "GET" }), {
    secret: process.env.PREVIEW_TICKET_SECRET,
    newsOrigin: process.env.NEWS_PREVIEW_ORIGIN,
  });
  brokerResponse.headers.forEach((value, name) => {
    response.setHeader(name, value);
  });
  const location = brokerResponse.headers.get("location");
  if (location) {
    response.redirect(brokerResponse.status, location);
    return;
  }
  response.status(brokerResponse.status).end();
}
