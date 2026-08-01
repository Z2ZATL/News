import "server-only";

import { redisKey } from "@/lib/redis-key";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

interface RedisResponse<T> {
  error?: string;
  result?: T;
}

async function redisFetch(path: string, body: unknown): Promise<Response> {
  if (!redisUrl || !redisToken) throw new Error("Redis is not configured");
  return fetch(`${redisUrl}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${redisToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(2_000),
  });
}

export function hasRedisConfiguration(): boolean {
  return Boolean(redisUrl && redisToken);
}

export async function redisCommand<T>(command: readonly (string | number)[]): Promise<T> {
  if (!redisUrl || !redisToken) throw new Error("Redis is not configured");
  const response = await redisFetch("", command);
  if (!response.ok) throw new Error(`Redis returned ${String(response.status)}`);
  const payload = (await response.json()) as RedisResponse<T>;
  if (payload.error) throw new Error("Redis command failed");
  return payload.result as T;
}

export async function redisPipeline<T extends readonly unknown[]>(
  commands: readonly (readonly (string | number)[])[],
): Promise<T> {
  const response = await redisFetch("/pipeline", commands);
  if (!response.ok) throw new Error(`Redis returned ${String(response.status)}`);
  const payload = (await response.json()) as Array<RedisResponse<unknown>>;
  if (payload.some((item) => item.error)) throw new Error("Redis pipeline failed");
  return payload.map((item) => item.result) as unknown as T;
}

export async function consumeOnce(key: string, ttlSeconds: number): Promise<boolean> {
  const result = await redisCommand<"OK" | null>([
    "SET",
    redisKey(key),
    "1",
    "NX",
    "EX",
    ttlSeconds,
  ]);
  return result === "OK";
}
