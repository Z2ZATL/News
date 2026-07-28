import type { Locale } from "@/lib/i18n";

import styles from "./article-reactions.module.css";

const reactions = [
  { id: "like", emoji: "👍", th: "ถูกใจ", en: "Like" },
  { id: "love", emoji: "❤️", th: "รักเลย", en: "Love" },
  { id: "haha", emoji: "😂", th: "ฮ่า ๆ", en: "Haha" },
  { id: "wow", emoji: "😮", th: "ว้าว", en: "Wow" },
  { id: "sad", emoji: "😢", th: "เศร้า", en: "Sad" },
  { id: "angry", emoji: "😡", th: "โกรธ", en: "Angry" },
] as const;

export function ArticleReactionsLoader({
  articleTitle,
  locale,
  slug,
}: Readonly<{
  articleTitle: string;
  locale: Locale;
  slug: string;
}>) {
  return (
    <section
      aria-labelledby={`reactions-${slug}`}
      className={styles.reactions}
      data-article-title={articleTitle}
      data-locale={locale}
      data-reaction-widget=""
      data-slug={slug}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>REACTION / STORY</p>
          <h2 id={`reactions-${slug}`}>
            {locale === "th"
              ? "คุณรู้สึกอย่างไรกับข่าวนี้?"
              : "How did this story make you feel?"}
          </h2>
        </div>
        <p className={styles.privacy}>
          {locale === "th"
            ? "นับผลรวมแบบไม่ระบุตัวตน และไม่เก็บชื่อหรืออีเมล"
            : "Anonymous aggregate; no name or email is stored"}
        </p>
      </div>

      <div
        aria-label={
          locale === "th"
            ? `เลือกความรู้สึกต่อข่าว ${articleTitle}`
            : `Choose a reaction to ${articleTitle}`
        }
        className={styles.options}
        role="group"
      >
        {reactions.map((reaction) => {
          const label = locale === "th" ? reaction.th : reaction.en;
          return (
            <button
              aria-label={`${label} 0`}
              aria-pressed="false"
              className={styles.option}
              data-label={label}
              data-reaction={reaction.id}
              disabled
              key={reaction.id}
              type="button"
            >
              <span className={styles.emoji} aria-hidden="true">
                {reaction.emoji}
              </span>
              <span>{label}</span>
              <small data-reaction-count="">0</small>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className={styles.status} data-reaction-status="">
        {locale === "th"
          ? "ระบบจะโหลดผลรวมเมื่อเลื่อนมาถึงส่วนนี้"
          : "Reaction totals load when this section approaches the viewport"}
      </p>
    </section>
  );
}
