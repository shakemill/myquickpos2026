import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyQuickPOS - Point of Sale",
    short_name: "MyQuickPOS",
    description: "Modern touch-screen point of sale system for managing terminals, orders, and payments.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0f1117",
    theme_color: "#0f1117",
    icons: [
      {
        src: "/icons/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  }
}
