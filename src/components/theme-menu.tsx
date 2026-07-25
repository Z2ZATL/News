"use client";

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n";

import styles from "./theme-menu.module.css";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeMenu({ locale }: Readonly<{ locale: Locale }>) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(currentTheme);

    const syncTheme = (event: StorageEvent) => {
      if (event.key !== "z2zs:theme") return;
      const nextTheme = event.newValue === "light" ? "light" : "dark";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      if (menu.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const chooseTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem("z2zs:theme", nextTheme);
    } catch {
      // The selected theme still applies to this page when storage is unavailable.
    }
    setOpen(false);
  };

  return (
    <div className={styles.menu} ref={menu}>
      <button
        aria-controls="custom-theme-options"
        aria-expanded={open}
        className={styles.trigger}
        onClick={() => {
          setOpen((current) => !current);
        }}
        type="button"
      >
        <span className={styles.themeDot} data-theme={theme} aria-hidden="true" />
        Custom Theme
      </button>
      {open ? (
        <div
          aria-label={locale === "th" ? "เลือกธีม" : "Choose theme"}
          className={styles.options}
          id="custom-theme-options"
          role="group"
        >
          <button
            aria-pressed={theme === "light"}
            onClick={() => {
              chooseTheme("light");
            }}
            type="button"
          >
            <span className={styles.lightPreview} aria-hidden="true" />
            Light
          </button>
          <button
            aria-pressed={theme === "dark"}
            onClick={() => {
              chooseTheme("dark");
            }}
            type="button"
          >
            <span className={styles.darkPreview} aria-hidden="true" />
            Dark
          </button>
        </div>
      ) : null}
    </div>
  );
}
