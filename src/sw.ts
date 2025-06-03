import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches automatically
cleanupOutdatedCaches();

// Cache strategy for images (cache-first, max 60 entries, 30 days)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache strategy for API calls (network-first)
registerRoute(
  ({ url }) => url.origin === 'https://api.themoviedb.org',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Fallback for navigation requests (e.g., SPA support)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly()
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});