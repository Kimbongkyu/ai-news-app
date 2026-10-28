import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 썸네일 허용 호스트. src/lib/rss/sources.ts의 IMAGE_HOSTS와 맞출 것.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "platform.theverge.com" },
      { protocol: "https", hostname: "techcrunch.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
