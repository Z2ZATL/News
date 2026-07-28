"use client";

import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";

import type { AtlasMapNode } from "@/lib/atlas-types";

import styles from "./atlas.module.css";

interface InteractiveAtlasProps {
  initialSelectedId?: string;
  navigationLabel: string;
  nodes: AtlasMapNode[];
  startEnabled?: boolean;
  startPaused?: boolean;
}

export function AtlasInteractionLoader(
  props: Readonly<Omit<InteractiveAtlasProps, "initialSelectedId" | "startEnabled">>,
) {
  const [InteractiveAtlas, setInteractiveAtlas] =
    useState<ComponentType<InteractiveAtlasProps> | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const focusId = useRef<string | undefined>(undefined);
  const startPaused = useRef(false);
  const loading = useRef(false);

  const activate = (
    nextSelectedId?: string,
    restoreFocus = false,
    pauseOnMount = false,
  ) => {
    if (nextSelectedId) {
      setSelectedId(nextSelectedId);
      if (restoreFocus) focusId.current = nextSelectedId;
    }
    if (pauseOnMount) startPaused.current = true;
    if (loading.current || InteractiveAtlas) return;
    loading.current = true;
    void import("@/components/atlas-canvas-loader").then((module) => {
      setInteractiveAtlas(() => module.AtlasCanvasLoader);
    });
  };

  useEffect(() => {
    if (!InteractiveAtlas || !focusId.current) return;
    const id = focusId.current;
    focusId.current = undefined;
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(`[data-atlas-node-id="${CSS.escape(id)}"]`)
        ?.focus();
    });
  }, [InteractiveAtlas]);

  if (InteractiveAtlas) {
    return (
      <InteractiveAtlas
        {...props}
        {...(selectedId ? { initialSelectedId: selectedId } : {})}
        startEnabled
        startPaused={startPaused.current}
      />
    );
  }

  return (
    <div
      className={styles.visualStack}
      data-atlas-hydrated="true"
      data-atlas-state={loading.current ? "loading" : "waiting"}
      onFocusCapture={(event) => {
        const id = event.target instanceof HTMLElement
          ? event.target.dataset.atlasNodeId
          : undefined;
        activate(id, Boolean(id), true);
      }}
      onPointerEnter={() => {
        activate(undefined, false, true);
      }}
      onTouchStart={() => {
        activate();
      }}
    >
      <div className={styles.planetFallback} aria-hidden="true" />
      <div className={styles.canvasFrame}>
        <nav className={styles.nodes} aria-label={props.navigationLabel}>
          {props.nodes.map((node) => (
            <button
              aria-expanded="false"
              aria-label={node.accessibleLabel}
              className={styles.node}
              data-atlas-node-id={node.id}
              data-country={node.countryCode}
              data-kind={node.kind}
              data-latitude={node.latitude}
              data-longitude={node.longitude}
              key={node.id}
              onClick={() => {
                activate(node.id, false, true);
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
      </div>
    </div>
  );
}
