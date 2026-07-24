"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";

import type { AtlasMapNode } from "@/lib/atlas-types";

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

export function AtlasCanvasLoader({
  navigationLabel,
  nodes,
}: Readonly<{
  navigationLabel: string;
  nodes: AtlasMapNode[];
}>) {
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [state, setState] = useState<"waiting" | "loading" | "ready" | "fallback">(
    "waiting",
  );

  useEffect(() => {
    if (enabled) return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
      <nav className={styles.nodes} aria-label={navigationLabel}>
        {nodes.map((node) => (
          <Link
            href={node.href}
            className={styles.node}
            data-featured={node.kind === "product" ? "true" : undefined}
            data-kind={node.kind}
            aria-label={`${node.indexLabel}. ${node.label}. ${node.location}`}
            key={`${node.kind}-${node.href}`}
          >
            <span className={styles.nodeCore} />
            <span className={styles.nodeLabel}>
              <b>{node.indexLabel}</b>
              {node.label}
            </span>
          </Link>
        ))}
      </nav>
      {enabled ? (
        <AtlasErrorBoundary onError={() => { setState("fallback"); }}>
          <AtlasCanvas
            animate={!reducedMotion}
            nodes={nodes}
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
