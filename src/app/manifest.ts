import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z2Zs Lab",
    short_name: "Z2Zs Lab",
    description: "Technology reporting, analysis, and experiments from Bangkok.",
    start_url: "/th",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#05070a",
    icons: [{ src: "/icon.png", sizes: "64x64", type: "image/png" }],
  };
}
