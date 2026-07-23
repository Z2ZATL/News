"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import styles from "./atlas.module.css";

const AtlasCanvas = dynamic(
  () => import("@/components/atlas-canvas").then((module) => module.AtlasCanvas),
  { ssr: false },
);

export function AtlasCanvasLoader() {
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");

  return (
    <div className={styles.visualStack} data-atlas-state={state}>
      <div className={styles.planetFallback} aria-hidden="true" />
      <AtlasCanvas
        onReady={() => setState("ready")}
        onUnavailable={() => setState("fallback")}
      />
    </div>
  );
}
