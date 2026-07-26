"use client";

import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

import styles from "./article-reactions.module.css";

interface ReactionProps {
  articleTitle: string;
  locale: Locale;
  slug: string;
}

export function ArticleReactionsLoader(props: Readonly<ReactionProps>) {
  const boundary = useRef<HTMLDivElement>(null);
  const [Reactions, setReactions] = useState<ComponentType<ReactionProps> | null>(
    null,
  );

  useEffect(() => {
    const target = boundary.current;
    if (!target) return;

    let active = true;
    const load = () => {
      void import("@/components/article-reactions").then((module) => {
        if (active) setReactions(() => module.ArticleReactions);
      });
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(target);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={boundary}>
      {Reactions ? (
        <Reactions {...props} />
      ) : (
        <section
          aria-busy="true"
          aria-labelledby={`reactions-${props.slug}`}
          className={styles.reactions}
        >
          <div className={styles.heading}>
            <div>
              <p className={styles.kicker}>REACTION / STORY</p>
              <h2 id={`reactions-${props.slug}`}>
                {props.locale === "th"
                  ? "คุณรู้สึกอย่างไรกับข่าวนี้?"
                  : "How did this story make you feel?"}
              </h2>
            </div>
            <p className={styles.privacy}>
              {props.locale === "th"
                ? "ระบบแสดงความรู้สึกจะพร้อมเมื่อเลื่อนมาถึงส่วนนี้"
                : "Reactions load when this section approaches the viewport"}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
