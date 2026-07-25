import "server-only";

function configuredOrigin(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

export function hasSameOrigin(request: Request): boolean {
  const supplied = request.headers.get("origin");
  if (!supplied) return false;

  const canonical = configuredOrigin();
  if (process.env.VERCEL_ENV === "production") return canonical !== null && supplied === canonical;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host || /[\s/@\\]/.test(host)) return false;
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.slice(0, -1);
  if (protocol !== "http" && protocol !== "https") return false;
  return supplied === `${protocol}://${host}`;
}
