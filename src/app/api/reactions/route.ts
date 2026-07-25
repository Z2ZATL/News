import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getArticle, getArticles } from "@/lib/content";
import { isProductionDeployment } from "@/lib/deployment";
import {
  createReactionVisitor,
  reactionCookieName,
  verifyReactionVisitor,
} from "@/lib/reaction-identity";
import { getReactionStore } from "@/lib/reaction-store";
import { reactionIdSchema } from "@/lib/reaction-types";
import { allowRequest } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/request-origin";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";

const mutationSchema = z
  .object({
    reaction: reactionIdSchema.nullable(),
    slug: z.string().regex(/^[a-z0-9-]{1,120}$/),
  })
  .strict();

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}

function tooManyRequests(): NextResponse {
  const response = noStore(NextResponse.json({ error: "Too Many Requests" }, { status: 429 }));
  response.headers.set("Retry-After", "60");
  return response;
}

async function rateLimited(request: Request, scope: string, limit: number): Promise<boolean> {
  try {
    return !(await allowRequest(request, { limit, scope, windowSeconds: 60 }));
  } catch {
    return true;
  }
}

export async function GET(request: Request) {
  if (await rateLimited(request, "reactions-read", 60)) {
    return tooManyRequests();
  }
  const requested = new URL(request.url).searchParams.get("slugs")?.split(",") ?? [];
  const parsed = z.array(z.string().regex(/^[a-z0-9-]{1,120}$/)).min(1).max(20).safeParse(requested);
  if (!parsed.success || new Set(parsed.data).size !== parsed.data.length) {
    return noStore(NextResponse.json({ error: "Bad Request" }, { status: 400 }));
  }
  const published = new Set((await getArticles()).map((article) => article.slug));
  if (parsed.data.some((slug) => !published.has(slug))) {
    return noStore(NextResponse.json({ error: "Not Found" }, { status: 404 }));
  }

  const secret = process.env.REACTION_COOKIE_SECRET;
  if (!secret) return noStore(NextResponse.json({ error: "Unavailable" }, { status: 503 }));
  const cookieStore = await cookies();
  const visitorId = verifyReactionVisitor(cookieStore.get(reactionCookieName())?.value, secret);
  try {
    const states = await getReactionStore().get(parsed.data, visitorId ?? undefined);
    return noStore(NextResponse.json({ states }));
  } catch {
    return noStore(NextResponse.json({ error: "Unavailable" }, { status: 503 }));
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return noStore(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }
  if (await rateLimited(request, "reactions-write", 20)) {
    return tooManyRequests();
  }

  let input: unknown;
  try {
    input = await readJsonBody(request, {
      allowedContentTypes: ["application/json"],
      maximumBytes: 2_048,
    });
  } catch (error) {
    return noStore(
      NextResponse.json(
        { error: error instanceof RequestBodyError ? error.message : "Bad Request" },
        { status: error instanceof RequestBodyError ? error.status : 400 },
      ),
    );
  }
  const parsed = mutationSchema.safeParse(input);
  if (!parsed.success) {
    return noStore(NextResponse.json({ error: "Bad Request" }, { status: 400 }));
  }
  if (!(await getArticle(parsed.data.slug))) {
    return noStore(NextResponse.json({ error: "Not Found" }, { status: 404 }));
  }

  const secret = process.env.REACTION_COOKIE_SECRET;
  if (!secret) return noStore(NextResponse.json({ error: "Unavailable" }, { status: 503 }));
  const cookieStore = await cookies();
  const cookieName = reactionCookieName();
  const existing = verifyReactionVisitor(cookieStore.get(cookieName)?.value, secret);
  const identity = existing ? { visitorId: existing, cookieValue: null } : createReactionVisitor(secret);
  try {
    const state = await getReactionStore().set(
      parsed.data.slug,
      identity.visitorId,
      parsed.data.reaction,
    );
    const response = noStore(NextResponse.json({ state }));
    if (identity.cookieValue) {
      response.cookies.set(cookieName, identity.cookieValue, {
        httpOnly: true,
        maxAge: 31_536_000,
        path: "/",
        sameSite: "lax",
        secure: isProductionDeployment(),
      });
    }
    return response;
  } catch {
    return noStore(NextResponse.json({ error: "Unavailable" }, { status: 503 }));
  }
}
