import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

const CACHE_VERSION = `v${pkg.version}`;

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-icon-180.png",
        "manifest-icon-192.maskable.png",
        "manifest-icon-512.maskable.png",
        "offline.html"
      ],
      manifest: {
        name: "Let's Stream V2.0",
        short_name: "Let's Stream",
        description: "Watch movies and TV shows online",
        theme_color: "#3b82f6",
        background_color: "#0f0f0f",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/3\//,
            handler: "NetworkFirst",
            options: {
              cacheName: `tmdb-api-${CACHE_VERSION}`,
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600, // 1 hour
              }
            }
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\//,
            handler: "CacheFirst",
            options: {
              cacheName: `tmdb-images-${CACHE_VERSION}`,
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2|ttf)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: `static-${CACHE_VERSION}`,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: "module"
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

const CACHE_VERSION = `v${pkg.version}`;

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-icon-180.png",
        "manifest-icon-192.maskable.png",
        "manifest-icon-512.maskable.png",
        "offline.html"
      ],
      manifest: {
        name: "Let's Stream V2.0",
        short_name: "Let's Stream",
        description: "Watch movies and TV shows online",
        theme_color: "#3b82f6",
        background_color: "#0f0f0f",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/3\//,
            handler: "NetworkFirst",
            options: {
              cacheName: `tmdb-api-${CACHE_VERSION}`,
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600, // 1 hour
              }
            }
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\//,
            handler: "CacheFirst",
            options: {
              cacheName: `tmdb-images-${CACHE_VERSION}`,
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2|ttf)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: `static-${CACHE_VERSION}`,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: "module"
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
