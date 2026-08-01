import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";

import { readBoundedBody, RequestBodyError } from "@/lib/request-body";

export async function POST(request: Request) {
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  let body: string;
  try {
    body = await readBoundedBody(request, {
      allowedContentTypes: ["application/json"],
      maximumBytes: 32_768,
    });
  } catch (error) {
    return new Response(error instanceof RequestBodyError ? error.message : "Bad Request", {
      status: error instanceof RequestBodyError ? error.status : 400,
    });
  }
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!signature || !secret || !(await isValidSignature(body, signature, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  if (!payload || typeof payload !== "object") return new Response("Bad Request", { status: 400 });
  const record = payload as { _type?: unknown; slug?: { current?: unknown } };
  const allowedTypes = new Set(["article", "author", "category", "project", "settings"]);
  if (typeof record._type !== "string" || !allowedTypes.has(record._type)) {
    return new Response("Bad Request", { status: 400 });
  }
  revalidateTag(record._type);
  if (typeof record.slug?.current === "string" && /^[a-z0-9-]{1,120}$/.test(record.slug.current)) {
    revalidateTag(`${record._type}:${record.slug.current}`);
  }
  return Response.json({ revalidated: true, at: Date.now() });
}
