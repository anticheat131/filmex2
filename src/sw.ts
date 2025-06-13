/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Clean old caches
cleanupOutdatedCaches();
self.skipWaiting();
self.clientsClaim();

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// HTML pages
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 604800 })] // 7 days
  })
);

// JS, CSS, fonts
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 2592000 })] // 30 days
  })
);

// TMDB images
registerRoute(
  ({ url }) => url.origin === 'https://image.tmdb.org',
  new CacheFirst({
    cacheName: 'tmdb-images',
    plugins: [new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 2592000 })]
  })
);

// TMDB API
registerRoute(
  ({ url }) => url.origin === 'https://api.themoviedb.org',
  new NetworkFirst({
    cacheName: 'tmdb-api',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 })]
  })
);

// Catch-all fallback (HTML only)
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error(); // fail silently for other types
});
