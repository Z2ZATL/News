import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function createCsp(nonce: string, allowsVimeo: boolean) {
  const development = process.env.NODE_ENV === "development";
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io",
    "font-src 'self'",
    "connect-src 'self' https://*.api.sanity.io https://cdn.sanity.io",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    allowsVimeo ? "frame-src https://player.vimeo.com" : "frame-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const allowsVimeo = /^\/(?:th|en)\/stories\/chatgpt-gpt-live-voice-update\/?$/.test(
    request.nextUrl.pathname,
  );
  const csp = createCsp(nonce, allowsVimeo);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const localeSegment = request.nextUrl.pathname.split("/")[1];
  requestHeaders.set("x-locale", localeSegment === "en" ? "en" : "th");
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=31536000");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), midi=(), browsing-topics=(), serial=(), xr-spatial-tracking=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Origin-Agent-Cluster", "?1");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
