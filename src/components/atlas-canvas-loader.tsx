"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { AtlasMapNode, AtlasScreenPosition } from "@/lib/atlas-types";

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
  const nodeRefs = useRef(new Map<string, HTMLAnchorElement>());

  const updatePositions = useCallback((positions: AtlasScreenPosition[]) => {
    for (const position of positions) {
      const node = nodeRefs.current.get(position.href);
      if (!node) continue;
      node.style.left = `${String(position.x)}%`;
      node.style.top = `${String(position.y)}%`;
      node.dataset.hemisphere = position.visible ? "front" : "back";
    }
  }, []);

  const useFallback = useCallback(() => {
    for (const node of nodeRefs.current.values()) {
      node.style.removeProperty("left");
      node.style.removeProperty("top");
      delete node.dataset.hemisphere;
    }
    setState("fallback");
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
      <div className={styles.canvasFrame}>
        <nav className={styles.nodes} aria-label={navigationLabel}>
          {nodes.map((node) => (
            <Link
              href={node.href}
              className={styles.node}
              data-featured={node.kind === "product" ? "true" : undefined}
              data-kind={node.kind}
              data-latitude={node.latitude}
              data-longitude={node.longitude}
              aria-label={`${node.indexLabel}. ${node.label}. ${node.location}`}
              key={`${node.kind}-${node.href}`}
              ref={(element) => {
                if (element) nodeRefs.current.set(node.href, element);
                else nodeRefs.current.delete(node.href);
              }}
              style={{
                translate: `${String(node.offset[0])}px ${String(node.offset[1])}px`,
              }}
              title={`${node.label} · ${node.location}`}
            >
              <span className={styles.nodeCore} />
              <span className={styles.nodeLabel}>
                <b>{node.indexLabel}</b>
                {node.label}
                <small>{node.location}</small>
              </span>
            </Link>
          ))}
        </nav>
        {enabled && state !== "fallback" ? (
          <AtlasErrorBoundary onError={useFallback}>
            <AtlasCanvas
              animate={!reducedMotion}
              nodes={nodes}
              onPositions={updatePositions}
              onReady={() => {
                setState("ready");
              }}
              onUnavailable={useFallback}
            />
          </AtlasErrorBoundary>
        ) : null}
      </div>
    </div>
  );
}
