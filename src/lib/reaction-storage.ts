export const REACTION_UPDATED_EVENT = "z2zs:reaction-updated";

export function reactionStorageKey(slug: string): string {
  return `z2zs:story-reaction:${slug}`;
}

export function storedReactionScore(slug: string): number {
  try {
    return window.localStorage.getItem(reactionStorageKey(slug)) ? 1 : 0;
  } catch {
    return 0;
  }
}
