import type { Route } from "next";

export interface AtlasSignal {
  author: string;
  href: Route;
  publishedAt: string;
  reactionScore: number;
  slug: string;
  title: string;
}

export interface AtlasMapNode {
  accessibleLabel: string;
  countryCode: string;
  id: string;
  kind: "story-country" | "product-country";
  latitude: number;
  longitude: number;
  offset: readonly [number, number];
  signals: AtlasSignal[];
}

export interface AtlasScreenPosition {
  id: string;
  visible: boolean;
  x: number;
  y: number;
}
