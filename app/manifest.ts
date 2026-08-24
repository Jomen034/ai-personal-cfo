import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tumara",
    short_name: "Tumara",
    description: "Tumbuh dengan arah.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f2eb",
    theme_color: "#166b53",
    lang: "id-ID",
    icons: [{ src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }, { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }],
  };
}