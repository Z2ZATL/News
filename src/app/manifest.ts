import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z2Zs Labs",
    short_name: "Z2Zs Labs",
    description: "Technology reporting, analysis, and experiments from Bangkok.",
    start_url: "/th",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#05070a",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
