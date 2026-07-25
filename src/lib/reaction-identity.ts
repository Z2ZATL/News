import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const visitorPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createReactionVisitor(secret: string): { cookieValue: string; visitorId: string } {
  const visitorId = randomUUID();
  return { cookieValue: `${visitorId}.${sign(visitorId, secret)}`, visitorId };
}

export function verifyReactionVisitor(value: string | undefined, secret: string): string | null {
  if (!value || value.length > 256) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [visitorId, suppliedSignature] = parts;
  if (!visitorId || !suppliedSignature || !visitorPattern.test(visitorId)) return null;
  const expectedSignature = sign(visitorId, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
    ? visitorId
    : null;
}

export function reactionCookieName(): string {
  return process.env.VERCEL_ENV === "production"
    ? "__Host-z2zs-reaction"
    : "z2zs-reaction-dev";
}
