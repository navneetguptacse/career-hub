import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareerHub — Job Application Tracker",
    short_name: "CareerHub",
    description:
      "Track, organize, and automate job applications with Kanban boards, Telegram ingestion, and career analytics.",
    id: "/",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0A0D12",
    theme_color: "#12171F",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon_x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/icons/icon_x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon_x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon_x320.png",
        sizes: "320x320",
        type: "image/png",
      },
      {
        src: "/icons/icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon_x1024.png",
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["productivity", "utilities", "business"],
  };
}
