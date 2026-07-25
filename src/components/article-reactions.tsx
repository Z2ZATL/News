"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import {
  REACTION_UPDATED_EVENT,
  reactionStorageKey,
} from "@/lib/reaction-storage";

import styles from "./article-reactions.module.css";

const reactions = [
  { id: "like", emoji: "👍", th: "ถูกใจ", en: "Like" },
  { id: "love", emoji: "❤️", th: "รักเลย", en: "Love" },
  { id: "haha", emoji: "😂", th: "ฮ่าๆ", en: "Haha" },
  { id: "wow", emoji: "😮", th: "ว้าว", en: "Wow" },
  { id: "sad", emoji: "😢", th: "เศร้า", en: "Sad" },
  { id: "angry", emoji: "😡", th: "โกรธ", en: "Angry" },
] as const;

type ReactionId = (typeof reactions)[number]["id"];

function isReactionId(value: string | null): value is ReactionId {
  return reactions.some((reaction) => reaction.id === value);
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
  const storageKey = reactionStorageKey(slug);
  const [selected, setSelected] = useState<ReactionId | null>(null);

  useEffect(() => {
    const readReaction = () => {
      try {
        const value = window.localStorage.getItem(storageKey);
        setSelected(isReactionId(value) ? value : null);
      } catch {
        setSelected(null);
      }
    };

    readReaction();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) readReaction();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [storageKey]);

  const chooseReaction = (reaction: ReactionId) => {
    const next = selected === reaction ? null : reaction;
    setSelected(next);
    try {
      if (next) {
        window.localStorage.setItem(storageKey, next);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // The reaction still works for the current page when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent(REACTION_UPDATED_EVENT, { detail: { slug } }));
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
            ? "บันทึกคำตอบไว้เฉพาะในเบราว์เซอร์นี้"
            : "Saved only in this browser"}
        </p>
      </div>

      <div
        className={styles.options}
        role="group"
        aria-label={
          locale === "th"
            ? `เลือกความรู้สึกต่อข่าว ${articleTitle}`
            : `Choose a reaction to ${articleTitle}`
        }
      >
        {reactions.map((reaction) => {
          const label = locale === "th" ? reaction.th : reaction.en;
          const active = selected === reaction.id;
          return (
            <button
              className={styles.option}
              data-active={active ? "true" : undefined}
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={() => {
                chooseReaction(reaction.id);
              }}
              key={reaction.id}
            >
              <span className={styles.emoji} aria-hidden="true">{reaction.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.status} aria-live="polite">
        {selectedReaction
          ? locale === "th"
            ? `คุณเลือก “${selectedReaction.th}” กดอีกครั้งเพื่อยกเลิก`
            : `You reacted “${selectedReaction.en}”. Press it again to remove it.`
          : locale === "th"
            ? "เลือกได้หนึ่งความรู้สึก"
            : "Choose one reaction"}
      </p>
    </section>
  );
}
