import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!signature || !secret || !(await isValidSignature(body, signature, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload: unknown = JSON.parse(body);
  if (!payload || typeof payload !== "object") return new Response("Bad Request", { status: 400 });
  const record = payload as { _type?: unknown; slug?: { current?: unknown } };
  if (typeof record._type === "string") revalidateTag(record._type);
  if (typeof record._type === "string" && typeof record.slug?.current === "string") {
    revalidateTag(`${record._type}:${record.slug.current}`);
  }
  return Response.json({ revalidated: true, at: Date.now() });
}
