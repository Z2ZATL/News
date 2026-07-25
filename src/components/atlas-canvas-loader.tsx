"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AtlasMapNode, AtlasScreenPosition } from "@/lib/atlas-types";

import styles from "./atlas.module.css";

const AtlasCanvas = dynamic(
  () => import("@/components/atlas-canvas").then((module) => module.AtlasCanvas),
  { ssr: false },
);

const connectorTargets = [
  { x: 23, y: 29 },
  { x: 77, y: 29 },
  { x: 23, y: 50 },
  { x: 77, y: 50 },
  { x: 23, y: 71 },
  { x: 77, y: 71 },
] as const;

function fallbackPoint(node: AtlasMapNode | null): Readonly<{ x: number; y: number }> {
  if (!node) return { x: 50, y: 50 };
  if (node.kind === "product-country") return { x: 68, y: 42 };
  if (node.countryCode === "CN") return { x: 61, y: 31 };
  if (node.countryCode === "TH") return { x: 66, y: 38 };
  if (node.countryCode === "US") return { x: 35, y: 34 };
  return { x: 50, y: 50 };
}

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
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<"waiting" | "loading" | "ready" | "fallback">(
    "waiting",
  );
  const connectorRefs = useRef(new Map<number, SVGLineElement>());
  const latestPositionsRef = useRef(new Map<string, AtlasScreenPosition>());
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? null;
  const selectedFallbackPoint = fallbackPoint(selectedNode);
  const selectedSignals = useMemo(() => {
    if (!selectedNode) return [];
    return [...selectedNode.signals]
      .sort((left, right) => {
        const scoreDifference = right.reactionScore - left.reactionScore;
        return scoreDifference || Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      })
      .slice(0, 6);
  }, [selectedNode]);

  const updatePositions = useCallback(
    (positions: AtlasScreenPosition[]) => {
      for (const position of positions) {
        latestPositionsRef.current.set(position.id, position);
        const node = nodeRefs.current.get(position.id);
        if (node) {
          node.style.left = `${String(position.x)}%`;
          node.style.top = `${String(position.y)}%`;
          node.dataset.hemisphere = position.visible ? "front" : "back";
        }
        if (position.id !== selectedId) continue;
        for (const [index, connector] of connectorRefs.current) {
          connector.setAttribute("x1", String(position.x));
          connector.setAttribute("y1", String(position.y));
          const target = connectorTargets[index];
          if (!target) continue;
          connector.setAttribute("x2", String(target.x));
          connector.setAttribute("y2", String(target.y));
        }
      }
    },
    [selectedId],
  );

  const useFallback = useCallback(() => {
    for (const node of nodeRefs.current.values()) {
      node.style.removeProperty("left");
      node.style.removeProperty("top");
      delete node.dataset.hemisphere;
    }
    setState("fallback");
  }, []);

  useLayoutEffect(() => {
    const position = selectedId
      ? latestPositionsRef.current.get(selectedId)
      : undefined;
    if (!position) return;

    for (const [index, connector] of connectorRefs.current) {
      const target = connectorTargets[index];
      if (!target) continue;
      connector.setAttribute("x1", String(position.x));
      connector.setAttribute("y1", String(position.y));
      connector.setAttribute("x2", String(target.x));
      connector.setAttribute("y2", String(target.y));
    }
  }, [selectedId]);

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
            <button
              aria-expanded={selectedId === node.id}
              aria-label={node.accessibleLabel}
              className={styles.node}
              data-country={node.countryCode}
              data-kind={node.kind}
              data-latitude={node.latitude}
              data-longitude={node.longitude}
              key={node.id}
              onClick={() => {
                setSelectedId((current) => (current === node.id ? null : node.id));
              }}
              onBlur={() => {
                setInteractionPaused(false);
              }}
              onFocus={() => {
                setInteractionPaused(true);
              }}
              onPointerEnter={() => {
                setInteractionPaused(true);
              }}
              onPointerLeave={() => {
                setInteractionPaused(false);
              }}
              ref={(element) => {
                if (element) nodeRefs.current.set(node.id, element);
                else nodeRefs.current.delete(node.id);
              }}
              style={{
                translate: `${String(node.offset[0])}px ${String(node.offset[1])}px`,
              }}
              title={node.accessibleLabel}
              type="button"
            >
              <span className={styles.nodeCore} />
            </button>
          ))}
        </nav>

        {selectedSignals.length ? (
          <>
            <svg
              aria-hidden="true"
              className={styles.connectors}
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <marker
                  id="atlas-arrow"
                  markerHeight="7"
                  markerWidth="7"
                  orient="auto"
                  refX="6"
                  refY="3.5"
                >
                  <path d="M0,0 L7,3.5 L0,7 Z" />
                </marker>
              </defs>
              {selectedSignals.map((signal, index) => (
                <line
                  className={styles.connector}
                  data-kind={selectedNode?.kind}
                  key={signal.slug}
                  x1={selectedFallbackPoint.x}
                  x2={connectorTargets[index]?.x}
                  y1={selectedFallbackPoint.y}
                  y2={connectorTargets[index]?.y}
                  ref={(element) => {
                    if (!element) {
                      connectorRefs.current.delete(index);
                      return;
                    }
                    connectorRefs.current.set(index, element);
                    const position = selectedId
                      ? latestPositionsRef.current.get(selectedId)
                      : undefined;
                    const target = connectorTargets[index];
                    if (!position || !target) return;
                    element.setAttribute("x1", String(position.x));
                    element.setAttribute("y1", String(position.y));
                    element.setAttribute("x2", String(target.x));
                    element.setAttribute("y2", String(target.y));
                  }}
                />
              ))}
            </svg>
            <div className={styles.signalPanels}>
              {selectedSignals.map((signal, index) => (
                <article
                  className={styles.signalCard}
                  data-atlas-card=""
                  data-side={index % 2 === 0 ? "left" : "right"}
                  data-slot={Math.floor(index / 2)}
                  key={signal.slug}
                >
                  <Link href={signal.href}>{signal.title}</Link>
                  <p>{signal.author}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}

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
              paused={interactionPaused}
            />
          </AtlasErrorBoundary>
        ) : null}
      </div>
    </div>
  );
}
