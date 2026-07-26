import { createHmac, randomUUID } from "node:crypto";

const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;

interface PreviewBrokerEnvironment {
  readonly newsOrigin: string | undefined;
  readonly secret: string | undefined;
}

function sign(encoded: string, secret: string): string {
  return createHmac("sha256", secret).update(encoded).digest("base64url");
}

function noStoreResponse(status: number): Response {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export function createPreviewResponse(
  request: Request,
  environment: PreviewBrokerEnvironment,
): Response {
  if (request.method !== "GET") return noStoreResponse(405);

  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("slug") ?? "";
  const locale = requestUrl.searchParams.get("locale") ?? "";
  const documentType = requestUrl.searchParams.get("type") ?? "";

  if (
    !SLUG_PATTERN.test(slug) ||
    (locale !== "th" && locale !== "en") ||
    (documentType !== "article" && documentType !== "project")
  ) {
    return noStoreResponse(400);
  }

  if (!environment.secret || !environment.newsOrigin) return noStoreResponse(503);

  const payload = {
    exp: Math.floor(Date.now() / 1_000) + 60,
    documentType,
    jti: randomUUID(),
    locale,
    slug,
    v: 1,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const ticket = `${encoded}.${sign(encoded, environment.secret)}`;
  const destination = new URL("/api/draft", environment.newsOrigin);
  destination.searchParams.set("ticket", ticket);

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Location: destination.toString(),
      "Referrer-Policy": "no-referrer",
    },
  });
}
