import { z } from "zod";

export const reactionIds = ["like", "love", "haha", "wow", "sad", "angry"] as const;
export const reactionIdSchema = z.enum(reactionIds);
export type ReactionId = z.infer<typeof reactionIdSchema>;

export type ReactionCounts = Record<ReactionId, number>;

export interface ReactionState {
  counts: ReactionCounts;
  selected: ReactionId | null;
  slug: string;
}

export function emptyReactionCounts(): ReactionCounts {
  return { angry: 0, haha: 0, like: 0, love: 0, sad: 0, wow: 0 };
}

export function reactionScore(counts: ReactionCounts): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}
