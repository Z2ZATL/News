import { createHmac, randomUUID } from "node:crypto";

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

function sign(encoded: string, secret: string): string {
  return createHmac("sha256", secret).update(encoded).digest("base64url");
}

export default function preview(request: PreviewRequest, response: PreviewResponse): void {
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  response.setHeader("Referrer-Policy", "no-referrer");
  if (request.method !== "GET") {
    response.status(405).end();
    return;
  }

  const slug = queryValue(request.query.slug);
  const locale = queryValue(request.query.locale);
  const documentType = queryValue(request.query.type);
  if (
    !/^[a-z0-9-]{1,120}$/.test(slug) ||
    (locale !== "th" && locale !== "en") ||
    (documentType !== "article" && documentType !== "project")
  ) {
    response.status(400).end();
    return;
  }

  const secret = process.env.PREVIEW_TICKET_SECRET;
  const newsOrigin = process.env.NEWS_PREVIEW_ORIGIN;
  if (!secret || !newsOrigin) {
    response.status(503).end();
    return;
  }

  const payload = {
    exp: Math.floor(Date.now() / 1_000) + 60,
    documentType,
    jti: randomUUID(),
    locale,
    slug,
    v: 1,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const ticket = `${encoded}.${sign(encoded, secret)}`;
  const destination = new URL("/api/draft", newsOrigin);
  destination.searchParams.set("ticket", ticket);
  response.redirect(302, destination.toString());
}
