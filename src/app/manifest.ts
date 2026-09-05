import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FE Coach",
    short_name: "FE Coach",
    description: "高品質・検証済みの基本情報技術者試験(FE)問題で学ぶ",
    start_url: "/",
    display: "standalone",
    background_color: "#eff6ff",
    // Matches --primary, so the PWA chrome does not fight the app it frames.
    theme_color: "#1D4ED8",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
