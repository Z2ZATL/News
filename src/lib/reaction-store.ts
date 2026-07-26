import "server-only";

import {
  emptyReactionCounts,
  reactionIdSchema,
  reactionIds,
  type ReactionCounts,
  type ReactionId,
  type ReactionState,
} from "@/lib/reaction-types";
import { redisKey } from "@/lib/redis-key";
import { hasRedisConfiguration, redisCommand, redisPipeline } from "@/lib/redis-rest";

export interface ReactionStore {
  get(slugs: readonly string[], visitorId?: string): Promise<ReactionState[]>;
  set(slug: string, visitorId: string, reaction: ReactionId | null): Promise<ReactionState>;
}

const memoryCounts = new Map<string, ReactionCounts>();
const memorySelections = new Map<string, ReactionId>();

function copyCounts(value: ReactionCounts | undefined): ReactionCounts {
  return value ? { ...value } : emptyReactionCounts();
}

const memoryStore: ReactionStore = {
  get(slugs, visitorId) {
    return Promise.resolve(
      slugs.map((slug) => ({
        counts: copyCounts(memoryCounts.get(slug)),
        selected: visitorId ? memorySelections.get(`${visitorId}:${slug}`) ?? null : null,
        slug,
      })),
    );
  },
  set(slug, visitorId, reaction) {
    const selectionKey = `${visitorId}:${slug}`;
    const previous = memorySelections.get(selectionKey);
    const counts = copyCounts(memoryCounts.get(slug));
    if (previous && previous !== reaction) counts[previous] = Math.max(0, counts[previous] - 1);
    if (reaction && previous !== reaction) counts[reaction] += 1;
    if (reaction) memorySelections.set(selectionKey, reaction);
    else memorySelections.delete(selectionKey);
    memoryCounts.set(slug, counts);
    return Promise.resolve({ counts: copyCounts(counts), selected: reaction, slug });
  },
};

function countsFromHash(value: readonly string[] | null): ReactionCounts {
  const counts = emptyReactionCounts();
  for (let index = 0; index < (value?.length ?? 0); index += 2) {
    const id = value?.[index];
    const count = Number(value?.[index + 1]);
    const parsed = reactionIdSchema.safeParse(id);
    if (parsed.success && Number.isSafeInteger(count) && count >= 0) counts[parsed.data] = count;
  }
  return counts;
}

const setReactionScript = `
local previous = redis.call('GET', KEYS[1])
local next = ARGV[1]
if previous == next then return previous or '' end
if previous then
  local remaining = redis.call('HINCRBY', KEYS[2], previous, -1)
  if remaining <= 0 then redis.call('HDEL', KEYS[2], previous) end
end
if next == '' then
  redis.call('DEL', KEYS[1])
else
  redis.call('SET', KEYS[1], next, 'EX', ARGV[2])
  redis.call('HINCRBY', KEYS[2], next, 1)
end
return next
`;

const redisStore: ReactionStore = {
  async get(slugs, visitorId) {
    const commands = slugs.flatMap((slug) => [
      ["HGETALL", redisKey(`reaction:counts:${slug}`)],
      ...(visitorId
        ? [["GET", redisKey(`reaction:visitor:${visitorId}:${slug}`)]]
        : []),
    ]);
    const results = await redisPipeline<unknown[]>(commands);
    let offset = 0;
    return slugs.map((slug) => {
      const hash = results[offset] as string[] | null;
      offset += 1;
      const selectedValue = visitorId ? results[offset] : null;
      if (visitorId) offset += 1;
      const selected = reactionIdSchema.safeParse(selectedValue);
      return {
        counts: countsFromHash(hash),
        selected: selected.success ? selected.data : null,
        slug,
      };
    });
  },
  async set(slug, visitorId, reaction) {
    await redisCommand<string>([
      "EVAL",
      setReactionScript,
      2,
      redisKey(`reaction:visitor:${visitorId}:${slug}`),
      redisKey(`reaction:counts:${slug}`),
      reaction ?? "",
      31_536_000,
    ]);
    const [state] = await this.get([slug], visitorId);
    if (!state) throw new Error("Reaction state unavailable");
    return state;
  },
};

export function getReactionStore(): ReactionStore {
  if (process.env.REACTION_STORE === "memory") return memoryStore;
  if (!hasRedisConfiguration()) throw new Error("Reaction store is not configured");
  return redisStore;
}

export async function getReactionTotals(slugs: readonly string[]): Promise<Record<string, number>> {
  try {
    const states = await getReactionStore().get(slugs);
    return Object.fromEntries(
      states.map((state) => [
        state.slug,
        reactionIds.reduce((total, id) => total + state.counts[id], 0),
      ]),
    );
  } catch {
    return Object.fromEntries(slugs.map((slug) => [slug, 0]));
  }
}
