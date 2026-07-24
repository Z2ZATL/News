import type { Route } from "next";

export interface AtlasMapNode {
  href: Route;
  indexLabel: string;
  kind: "story" | "product";
  label: string;
  latitude: number;
  location: string;
  longitude: number;
  offset: readonly [number, number];
}
