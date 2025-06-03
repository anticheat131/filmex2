import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import pkg from './package.json';

const CACHE_VERSION = `v${pkg.version}`;
const CACHE_NAMES = {
  pages: `pages-cache-${CACHE_VERSION}`,
  static: `static-assets-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  tmdbApi: `tmdb-api-${CACHE_VERSION}`,
  tmdbImages: `tmdb-images-${CACHE_VERSION}`,
  firebaseData: `firebase-data-${CACHE_VERSION}`,
  googleApis: `google-apis-${CACHE_VERSION}`
};

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', // the output service worker filename
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 5000000,
      },
      manifest: {
        name: "Let's Stream V2.0",
        short_name: "Let's Stream",
        description: "Watch movies and TV shows online",
        theme_color: '#3b82f6',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE_NAMES.pages,
              networkTimeoutSeconds: 3,
              plugins: [{
                requestWillFetch: async ({ event }) => {
                  if (event.preloadResponse) {
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) return preloadResponse;
                  }
                  return event.request;
                },
                handlerDidError: async () => {
                  const cache = await caches.open(CACHE_NAMES.pages);
                  const cached = await cache.match('/offline.html');
                  return cached || Response.error();
                }
              }]
            }
          },
          {
            urlPattern: /\.(css|js|woff2|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.static,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.images,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [{
                handlerDidError: async () => {
                  const cache = await caches.open(CACHE_NAMES.static);
                  return cache.match('/placeholder.svg');
                }
              }]
            }
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/3\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE_NAMES.tmdbApi,
              networkTimeoutSeconds: 3,
              plugins: [{
                cacheWillUpdate: async ({ response }) => {
                  if (response && response.status === 200) {
                    try {
                      const cloned = response.clone();
                      const data = await cloned.json();
                      if (data && !data.error) return response;
                    } catch { }
                  }
                  return null;
                }
              }],
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600
              }
            }
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.tmdbImages,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: { statuses: [0, 200] },
              matchOptions: { ignoreVary: true },
              plugins: [{
                handlerDidError: async () => {
                  const cache = await caches.open(CACHE_NAMES.static);
                  return cache.match('/placeholder.svg');
                }
              }]
            }
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('firestore.googleapis.com') ||
              url.hostname.includes('firebase.googleapis.com') ||
              url.hostname.includes('firebaseio.com'),
            handler: 'NetworkOnly',
            options: {
              plugins: [{
                fetchDidFail: async () => {
                  console.error('Firebase request failed - network only strategy');
                }
              }]
            }
          },
          {
            urlPattern: /^https:\/\/(apis\.google\.com|www\.googleapis\.com)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE_NAMES.googleApis,
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              },
              plugins: [{
                handlerDidError: async ({ request }) => {
                  console.error('Google API request failed:', request.url);
                  return undefined;
                }
              }]
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));