import { createClient } from "@sanity/client";
import { draftMode } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { consumeOnce, hasRedisConfiguration } from "@/lib/redis-rest";
import { verifyPreviewTicket } from "@/lib/preview-ticket";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticket = verifyPreviewTicket(
    url.searchParams.get("ticket") ?? "",
    process.env.PREVIEW_TICKET_SECRET,
  );
  if (!ticket) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!hasRedisConfiguration()) return new Response("Preview unavailable", { status: 503 });

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !token) return new Response("Preview unavailable", { status: 503 });
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2025-01-01",
    token,
    useCdn: false,
    perspective: "drafts",
  });
  const exists = await client.fetch<boolean>(
    `count(*[_type == $documentType && slug.current == $slug]) > 0`,
    { documentType: ticket.documentType, slug: ticket.slug },
  );
  if (!exists) return new Response("Not Found", { status: 404 });

  let consumed = false;
  try {
    consumed = await consumeOnce(`preview-ticket:${ticket.jti}`, 120);
  } catch {
    return new Response("Preview unavailable", { status: 503 });
  }
  if (!consumed) return new Response("Unauthorized", { status: 401 });

  (await draftMode()).enable();
  const segment = ticket.documentType === "article" ? "stories" : "projects";
  redirect(`/${ticket.locale}/${segment}/${ticket.slug}` as Route);
}
