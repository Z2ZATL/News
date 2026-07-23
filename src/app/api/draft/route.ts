import { createClient } from "@sanity/client";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { safeEqual } from "@/lib/safe-equal";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  const locale = url.searchParams.get("locale") ?? "th";

  if (!safeEqual(secret, process.env.SANITY_PREVIEW_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!/^[a-z0-9-]{1,120}$/.test(slug) || (locale !== "th" && locale !== "en")) {
    return new Response("Bad Request", { status: 400 });
  }

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
    `count(*[_type == "article" && slug.current == $slug]) > 0`,
    { slug },
  );
  if (!exists) return new Response("Not Found", { status: 404 });

  (await draftMode()).enable();
  redirect(`/${locale}/stories/${slug}`);
}
