"use client";

import dynamic from "next/dynamic";
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";

import styles from "./atlas.module.css";

const AtlasCanvas = dynamic(
  () => import("@/components/atlas-canvas").then((module) => module.AtlasCanvas),
  { ssr: false },
);

class AtlasErrorBoundary extends Component<
  Readonly<{ children: ReactNode; onError: () => void }>,
  Readonly<{ hasError: boolean }>
> {
  override state = { hasError: false };

  static getDerivedStateFromError(): Readonly<{ hasError: boolean }> {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
    this.props.onError();
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export function AtlasCanvasLoader() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<"waiting" | "loading" | "ready" | "fallback">(
    "waiting",
  );

  useEffect(() => {
    if (enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setEnabled(true);
      setState("loading");
    }, 1_200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled]);

  const enableCanvas = () => {
    if (enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    setState("loading");
  };

  return (
    <div
      className={styles.visualStack}
      data-atlas-state={state}
      onFocusCapture={enableCanvas}
      onPointerEnter={enableCanvas}
      onTouchStart={enableCanvas}
    >
      <div className={styles.planetFallback} aria-hidden="true" />
      {enabled ? (
        <AtlasErrorBoundary onError={() => { setState("fallback"); }}>
          <AtlasCanvas
            onReady={() => {
              setState("ready");
            }}
            onUnavailable={() => {
              setState("fallback");
            }}
          />
        </AtlasErrorBoundary>
      ) : null}
    </div>
  );
}
