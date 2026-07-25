import "server-only";

import { createHmac } from "node:crypto";

import { hasRedisConfiguration, redisCommand } from "@/lib/redis-rest";

const memoryWindows = new Map<string, { count: number; expiresAt: number }>();

function clientAddress(request: Request): string {
  if (process.env.VERCEL_ENV === "production") {
    return request.headers.get("x-vercel-forwarded-for") ?? "unknown";
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function identifier(request: Request, scope: string): string {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) throw new Error("Rate-limit secret is not configured");
  return createHmac("sha256", secret)
    .update(`${scope}:${clientAddress(request)}`)
    .digest("hex")
    .slice(0, 32);
}

export async function allowRequest(
  request: Request,
  options: Readonly<{ limit: number; scope: string; windowSeconds: number }>,
): Promise<boolean> {
  const key = `rate:${options.scope}:${identifier(request, options.scope)}`;
  if (process.env.REACTION_STORE === "memory") {
    const now = Date.now();
    const current = memoryWindows.get(key);
    if (!current || current.expiresAt <= now) {
      memoryWindows.set(key, { count: 1, expiresAt: now + options.windowSeconds * 1_000 });
      return true;
    }
    current.count += 1;
    return current.count <= options.limit;
  }
  if (!hasRedisConfiguration()) throw new Error("Rate-limit store is not configured");
  const result = await redisCommand<number>([
    "EVAL",
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
    1,
    key,
    options.windowSeconds,
  ]);
  return result <= options.limit;
}
