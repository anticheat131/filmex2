/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim, skipWaiting } from 'workbox-core';           // ← import these
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Clean up old caches
cleanupOutdatedCaches();

// Properly tell the SW to take control immediately
skipWaiting();
clientsClaim();

// Precache Vite build assets
precacheAndRoute(self.__WB_MANIFEST);

// HTML navigations
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [ new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }) ]
  })
);

// Static assets (JS/CSS/fonts)
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [ new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }) ]
  })
);

// Dynamic chunks (hashed JS/CSS in /assets/)
registerRoute(
  ({ url }) => url.pathname.startsWith('/assets/') && /\.(?:js|css)$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'dynamic-chunks',
    plugins: [ new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }) ]
  })
);

// TMDB images
registerRoute(
  ({ url }) => url.origin === 'https://image.tmdb.org',
  new CacheFirst({
    cacheName: 'tmdb-images',
    plugins: [ new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 }) ]
  })
);

// TMDB API
registerRoute(
  ({ url }) => url.origin === 'https://api.themoviedb.org',
  new NetworkFirst({
    cacheName: 'tmdb-api',
    networkTimeoutSeconds: 5,
    plugins: [ new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 }) ]
  })
);

// Fallback handler
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  // silently swallow other errors (e.g. failed chunk loads)
  return new Response('', { status: 200, statusText: 'OK' });
});
