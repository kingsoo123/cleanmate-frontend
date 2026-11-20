import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// @ducanh2912/next-pwa hooks webpack only — use `next build --webpack` (see package.json).
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  // Caching HTML/RSC navigations breaks styling after deploys (stale HTML + new CSS hashes).
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  dynamicStartUrl: false,
  cacheStartUrl: false,
  extendDefaultRuntimeCaching: false,
  workboxOptions: {
    disableDevLogs: true,
    // Do not precache hashed CSS — stale SW + new HTML = 404 stylesheets (common on installed PWA / Android).
    exclude: [/\.css$/],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "washuply-html",
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 },
        },
      },
      {
        urlPattern: /\/_next\/static\/css\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "washuply-css",
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPWA(nextConfig);
