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
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}