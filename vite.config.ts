/// <reference lib="webworker" />
/// <reference path="./workbox.d.ts" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = `v${pkg.version}`;

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: '::',
    port: 8080,
    mimeTypes: {
      '.js': 'application/javascript',
      '.json': 'application/json'
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group'
          ],
          'firebase-auth': ['firebase/auth', '@firebase/auth'],
          'data-visualization': ['recharts'],
          'icons': ['lucide-react', 'react-icons', 'react-feather']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-icon-180.png',
        'manifest-icon-192.maskable.png',
        'manifest-icon-512.maskable.png',
        'offline.html'
      ],
      manifest: {
        name: "Let's Stream V2.0",
        short_name: "Let's Stream",
        description: "Watch movies and TV shows online",
        theme_color: '#3b82f6',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/offline.html',  // <-- Updated here
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: `pages-cache-${CACHE_VERSION}`,
              networkTimeoutSeconds: 3,
              plugins: [{
                handlerDidError: async () => {
                  const cache = await self.caches.open(`pages-cache-${CACHE_VERSION}`);
                  return cache.match('/offline.html');
                }
              }]
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2|ttf)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: `static-cache-${CACHE_VERSION}`,
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/3\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: `tmdb-api-${CACHE_VERSION}`,
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    if (response && response.status === 200) {
                      try {
                        const cloned = response.clone();
                        const data = await cloned.json();
                        if (data && Array.isArray(data.results)) {
                          return response;
                        }
                        console.warn('TMDB response missing valid results array');
                      } catch (e) {
                        console.error('Error parsing TMDB response:', e);
                      }
                    }
                    return null;
                  }
                }
              ]
            }
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\//,
            handler: 'CacheFirst',
            options: {
              cacheName: `tmdb-images-${CACHE_VERSION}`,
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: false, type: 'module' }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
}));
