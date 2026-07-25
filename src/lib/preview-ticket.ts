import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

const previewTicketPayload = z
  .object({
    exp: z.number().int().positive(),
    jti: z.uuid(),
    locale: z.enum(["th", "en"]),
    documentType: z.enum(["article", "project"]),
    slug: z.string().regex(/^[a-z0-9-]{1,120}$/),
    v: z.literal(1),
  })
  .strict();

export type PreviewTicketPayload = z.infer<typeof previewTicketPayload>;

function signature(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createPreviewTicket(
  payload: PreviewTicketPayload,
  secret: string,
): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${signature(encoded, secret)}`;
}

export function verifyPreviewTicket(
  ticket: string,
  secret: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1_000),
): PreviewTicketPayload | null {
  if (!secret || ticket.length > 1_024) return null;
  const parts = ticket.split(".");
  if (parts.length !== 2) return null;
  const [encoded, suppliedSignature] = parts;
  if (!encoded || !suppliedSignature) return null;
  const expectedSignature = signature(encoded, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const parsed = previewTicketPayload.safeParse(
      JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as unknown,
    );
    if (!parsed.success || parsed.data.exp < nowSeconds || parsed.data.exp > nowSeconds + 60) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}
