/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST || []);

clientsClaim();

// Cache names matching your versioning scheme
const CACHE_VERSION = 'v1'; // replace with your version string if needed or import from config
const CACHE_NAMES = {
  pages: `pages-cache-${CACHE_VERSION}`,
  static: `static-assets-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  tmdbApi: `tmdb-api-${CACHE_VERSION}`,
  tmdbImages: `tmdb-images-${CACHE_VERSION}`,
  firebaseData: `firebase-data-${CACHE_VERSION}`,
  googleApis: `google-apis-${CACHE_VERSION}`
};

// App Shell routing for SPA navigation fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: CACHE_NAMES.pages,
    networkTimeoutSeconds: 3,
    plugins: [{
      // Handle preload response if available
      async requestWillFetch({ event }) {
        try {
          if (event.preloadResponse) {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) return preloadResponse;
          }
        } catch (error) {
          console.error('Error handling preload response:', error);
        }
        return event.request;
      },
      // Fallback to offline page when network fails
      async handlerDidError() {
        const cache = await caches.open(CACHE_NAMES.pages);
        const cachedResponse = await cache.match('/offline.html');
        if (cachedResponse) return cachedResponse;
        try {
          const response = await fetch('/offline.html');
          if (response && response.ok) {
            cache.put('/offline.html', response.clone());
            return response;
          }
        } catch {
          // ignore
        }
        return Response.error();
      }
    }]
  })
);

// Cache JS, CSS, font files with Cache First
registerRoute(
  /\.(css|js|woff2|ttf)$/i,
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response && [0, 200].includes(response.status) ? response : null;
        }
      }
    ],
    maxEntries: 200,
    maxAgeSeconds: 30 * 24 * 60 * 60
  })
);

// Cache images with Cache First
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response && [0, 200].includes(response.status) ? response : null;
        },
        handlerDidError: async () => {
          const cache = await caches.open(CACHE_NAMES.static);
          return cache.match('/placeholder.svg');
        }
      }
    ],
    maxEntries: 500,
    maxAgeSeconds: 30 * 24 * 60 * 60
  })
);

// TMDB API calls — Network First with JSON validation
registerRoute(
  /^https:\/\/api\.themoviedb\.org\/3\/.*/i,
  new NetworkFirst({
    cacheName: CACHE_NAMES.tmdbApi,
    networkTimeoutSeconds: 3,
    plugins: [
      {
        async cacheWillUpdate({ response }) {
          if (response && response.status === 200) {
            try {
              const cloned = response.clone();
              const data = await cloned.json();
              if (!data.error) return response;
            } catch {
              // Invalid JSON, skip caching
            }
          }
          return null;
        }
      }
    ],
    maxEntries: 100,
    maxAgeSeconds: 3600
  })
);

// TMDB images — Cache First
registerRoute(
  /^https:\/\/image\.tmdb\.org\/t\/p\/.*/i,
  new CacheFirst({
    cacheName: CACHE_NAMES.tmdbImages,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response && [0, 200].includes(response.status) ? response : null;
        },
        handlerDidError: async () => {
          const cache = await caches.open(CACHE_NAMES.static);
          return cache.match('/placeholder.svg');
        }
      }
    ],
    maxEntries: 500,
    maxAgeSeconds: 30 * 24 * 60 * 60
  })
);

// Firebase endpoints — Network Only
registerRoute(
  ({ url }) =>
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('firebaseio.com'),
  new NetworkOnly({
    plugins: [
      {
        fetchDidFail: async () => {
          console.error('Firebase request failed - network only strategy');
        }
      }
    ]
  })
);

// Google APIs — Network First
registerRoute(
  /^https:\/\/(apis\.google\.com|www\.googleapis\.com)\/.*/i,
  new NetworkFirst({
    cacheName: CACHE_NAMES.googleApis,
    networkTimeoutSeconds: 3,
    plugins: [
      {
        handlerDidError: async ({ request }) => {
          console.error('Google API request failed:', request.url);
          return undefined;
        }
      }
    ],
    maxEntries: 50,
    maxAgeSeconds: 3600
  })
);