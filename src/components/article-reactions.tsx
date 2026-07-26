"use client";

import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import {
  emptyReactionCounts,
  type ReactionCounts,
  type ReactionId,
  type ReactionState,
} from "@/lib/reaction-types";

import styles from "./article-reactions.module.css";

const reactions = [
  { id: "like", emoji: "👍", th: "ถูกใจ", en: "Like" },
  { id: "love", emoji: "❤️", th: "รักเลย", en: "Love" },
  { id: "haha", emoji: "😂", th: "ฮ่า ๆ", en: "Haha" },
  { id: "wow", emoji: "😮", th: "ว้าว", en: "Wow" },
  { id: "sad", emoji: "😢", th: "เศร้า", en: "Sad" },
  { id: "angry", emoji: "😡", th: "โกรธ", en: "Angry" },
] as const;

function isReactionState(value: unknown, slug: string): value is ReactionState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<ReactionState>;
  return state.slug === slug && Boolean(state.counts);
}

export function ArticleReactions({
  articleTitle,
  locale,
  slug,
}: Readonly<{
  articleTitle: string;
  locale: Locale;
  slug: string;
}>) {
  const [selected, setSelected] = useState<ReactionId | null>(null);
  const [counts, setCounts] = useState<ReactionCounts>(emptyReactionCounts);
  const [pending, setPending] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/reactions?slugs=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Reaction state unavailable");
      const payload = (await response.json()) as { states?: unknown[] };
      const state = payload.states?.[0];
      if (!isReactionState(state, slug)) throw new Error("Invalid reaction state");
      setCounts(state.counts);
      setSelected(state.selected);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const chooseReaction = async (reaction: ReactionId) => {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reaction: selected === reaction ? null : reaction, slug }),
      });
      if (!response.ok) throw new Error("Reaction update failed");
      const payload = (await response.json()) as { state?: unknown };
      if (!isReactionState(payload.state, slug)) throw new Error("Invalid reaction state");
      setCounts(payload.state.counts);
      setSelected(payload.state.selected);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setPending(false);
    }
  };

  const selectedReaction = reactions.find((reaction) => reaction.id === selected);

  return (
    <section className={styles.reactions} aria-labelledby={`reactions-${slug}`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>REACTION / STORY</p>
          <h2 id={`reactions-${slug}`}>
            {locale === "th" ? "คุณรู้สึกอย่างไรกับข่าวนี้?" : "How did this story make you feel?"}
          </h2>
        </div>
        <p className={styles.privacy}>
          {locale === "th"
            ? "นับผลรวมแบบไม่ระบุตัวตน และไม่เก็บชื่อหรืออีเมล"
            : "Anonymous aggregate; no name or email is stored"}
        </p>
      </div>

      <div
        className={styles.options}
        role="group"
        aria-label={locale === "th" ? `เลือกความรู้สึกต่อข่าว ${articleTitle}` : `Choose a reaction to ${articleTitle}`}
      >
        {reactions.map((reaction) => {
          const label = locale === "th" ? reaction.th : reaction.en;
          const active = selected === reaction.id;
          return (
            <button
              className={styles.option}
              data-active={active ? "true" : undefined}
              type="button"
              aria-label={`${label} ${String(counts[reaction.id])}`}
              aria-pressed={active}
              disabled={pending || unavailable}
              onClick={() => { void chooseReaction(reaction.id); }}
              key={reaction.id}
            >
              <span className={styles.emoji} aria-hidden="true">{reaction.emoji}</span>
              <span>{label}</span>
              <small>{counts[reaction.id]}</small>
            </button>
          );
        })}
      </div>

      <p className={styles.status} aria-live="polite">
        {unavailable
          ? locale === "th" ? "ระบบแสดงความรู้สึกไม่พร้อมใช้งานชั่วคราว" : "Reactions are temporarily unavailable"
          : selectedReaction
            ? locale === "th"
              ? `คุณเลือก “${selectedReaction.th}” กดอีกครั้งเพื่อยกเลิก`
              : `You reacted “${selectedReaction.en}”. Press it again to remove it.`
            : locale === "th" ? "เลือกได้หนึ่งความรู้สึก" : "Choose one reaction"}
      </p>
    </section>
  );
}
