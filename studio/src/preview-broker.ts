import { createHmac, randomUUID } from "node:crypto";

const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;

interface PreviewBrokerEnvironment {
  readonly newsOrigin: string | undefined;
  readonly projectId: string | undefined;
  readonly secret: string | undefined;
  readonly verifyEditor?: (token: string, projectId: string) => Promise<boolean>;
}

function sign(encoded: string, secret: string): string {
  return createHmac("sha256", secret).update(encoded).digest("base64url");
}

function noStoreResponse(status: number, body: BodyInit | null = null): Response {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      ...(body === null ? {} : { "Content-Type": "application/json; charset=utf-8" }),
      "Referrer-Policy": "no-referrer",
    },
  });
}

function bearerToken(request: Request): string | undefined {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer ([A-Za-z0-9._~+/-]{20,4096}=*)$/.exec(authorization);
  return match?.[1];
}

async function verifySanityEditor(token: string, projectId: string): Promise<boolean> {
  if (!/^[a-z0-9-]{1,64}$/.test(projectId)) return false;
  try {
    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2025-01-01/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!response.ok) return false;
    const user = (await response.json()) as unknown;
    if (typeof user !== "object" || user === null) return false;
    const candidate = user as { id?: unknown; roles?: unknown };
    if (typeof candidate.id !== "string" || !Array.isArray(candidate.roles)) return false;
    return candidate.roles.some((role) => {
      if (typeof role !== "object" || role === null) return false;
      const name = (role as { name?: unknown }).name;
      return name === "administrator" || name === "developer" || name === "editor";
    });
  } catch {
    return false;
  }
}

interface PreviewCoordinates {
  readonly documentType: string;
  readonly locale: string;
  readonly slug: string;
}

async function previewCoordinates(request: Request): Promise<PreviewCoordinates | undefined> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") return undefined;
  try {
    const value = (await request.json()) as unknown;
    if (typeof value !== "object" || value === null) return undefined;
    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.slug !== "string" ||
      typeof candidate.locale !== "string" ||
      typeof candidate.documentType !== "string"
    ) {
      return undefined;
    }
    return {
      documentType: candidate.documentType,
      locale: candidate.locale,
      slug: candidate.slug,
    };
  } catch {
    return undefined;
  }
}

export async function createPreviewResponse(
  request: Request,
  environment: PreviewBrokerEnvironment,
): Promise<Response> {
  if (request.method !== "POST") return noStoreResponse(405);
  if (!environment.secret || !environment.newsOrigin || !environment.projectId) {
    return noStoreResponse(503);
  }
  const token = bearerToken(request);
  if (!token) return noStoreResponse(401);
  const isEditor = await (environment.verifyEditor ?? verifySanityEditor)(
    token,
    environment.projectId,
  );
  if (!isEditor) return noStoreResponse(403);

  const coordinates = await previewCoordinates(request);
  if (!coordinates) return noStoreResponse(400);
  const { documentType, locale, slug } = coordinates;

  if (
    !SLUG_PATTERN.test(slug) ||
    (locale !== "th" && locale !== "en") ||
    (documentType !== "article" && documentType !== "project")
  ) {
    return noStoreResponse(400);
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
  const ticket = `${encoded}.${sign(encoded, environment.secret)}`;
  const destination = new URL("/api/draft", environment.newsOrigin);
  destination.searchParams.set("ticket", ticket);

  return noStoreResponse(
    200,
    JSON.stringify({ url: destination.toString() }),
  );
}
