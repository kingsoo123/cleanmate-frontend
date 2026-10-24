import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Washuply — Laundry Platform",
    short_name: "Washuply",
    description:
      "Pickup, orders, payments, and messaging for laundry businesses and customers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ebe8ff",
    theme_color: "#635bff",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
