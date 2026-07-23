"use client";

import dynamic from "next/dynamic";

const AtlasCanvas = dynamic(
  () => import("@/components/atlas-canvas").then((module) => module.AtlasCanvas),
  { ssr: false },
);

export function AtlasCanvasLoader() {
  return <AtlasCanvas />;
}
