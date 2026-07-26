import type { Locale } from "@/lib/i18n";

import styles from "./theme-menu.module.css";

export function ThemeMenu({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <details className={styles.menu} data-theme-menu="">
      <summary className={styles.trigger} role="button">
        <span className={styles.themeDot} aria-hidden="true" />
        Custom Theme
      </summary>
      <div
        aria-label={locale === "th" ? "เลือกธีม" : "Choose theme"}
        className={styles.options}
        role="group"
      >
        <button aria-pressed="false" data-theme-choice="light" type="button">
          <span className={styles.lightPreview} aria-hidden="true" />
          Light
        </button>
        <button aria-pressed="true" data-theme-choice="dark" type="button">
          <span className={styles.darkPreview} aria-hidden="true" />
          Dark
        </button>
      </div>
    </details>
  );
}
