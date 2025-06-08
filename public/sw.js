if (!self.define) {
  let s, e = {};
  const i = (i, r) => (
    i = new URL(i + ".js", r).href,
    e[i] || new Promise((e => {
      if ("document" in self) {
        const s = document.createElement("script");
        s.src = i, s.onload = e, document.head.appendChild(s);
      } else s = i, importScripts(i), e();
    })).then(() => {
      let s = e[i];
      if (!s) throw new Error(`Module ${i} didn’t register its module`);
      return s;
    })
  );
  self.define = (r, n) => {
    const l = s || ("document" in self ? document.currentScript.src : "") || location.href;
    if (e[l]) return;
    let a = {};
    const o = s => i(s, l), t = { module: { uri: l }, exports: a, require: o };
    e[l] = Promise.all(r.map(s => t[s] || o(s))).then(s => (n(...s), a));
  };
}

define(["./workbox-4cded710"], (function (workbox) {
  "use strict";

  workbox.enable();
  self.skipWaiting();
  workbox.clientsClaim();

  workbox.precacheAndRoute([
    { url: "offline.html", revision: "77345e15c929c1097b9ecec4d0c590d5" },
    { url: "favicon.ico", revision: "1c29dd2a7ba58b92cd9a31771741db02" },
    { url: "manifest.webmanifest", revision: "bfc27035e06556a352a3a6134904fbee" }
  ]);

  workbox.cleanupOutdatedCaches();

  workbox.registerRoute(
    ({ request }) => request.mode === "navigate",
    new workbox.NetworkFirst({
      cacheName: "pages-cache-v1",
      networkTimeoutSeconds: 3,
      plugins: [
        {
          handlerDidError: async () => {
            const cache = await caches.open("pages-cache-v1");
            return await cache.match("/offline.html");
          }
        }
      ]
    }),
    "GET"
  );

  workbox.registerRoute(
    /\.(?:css|js|woff2|ttf)$/i,
    new workbox.CacheFirst({
      cacheName: "static-assets-v1",
      plugins: [
        new workbox.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] })
      ]
    }),
    "GET"
  );

  workbox.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
    new workbox.CacheFirst({
      cacheName: "images-v1",
      plugins: [
        new workbox.ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
        {
          handlerDidError: async () => {
            const cache = await caches.open("static-assets-v1");
            return await cache.match("/placeholder.svg");
          }
        }
      ]
    }),
    "GET"
  );

  workbox.registerRoute(
    /^https:\/\/api\.themoviedb\.org\/3\//i,
    new workbox.NetworkFirst({
      cacheName: "tmdb-api-v1",
      networkTimeoutSeconds: 3,
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            if (response && response.status === 200) {
              try {
                const data = await response.clone().json();
                if (data && Array.isArray(data.results)) {
                  return response;
                } else {
                  console.warn("TMDB response missing valid 'results' array.");
                }
              } catch (e) {
                console.error("Error parsing TMDB response:", e);
              }
            }
            return null;
          }
        },
        new workbox.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 })
      ]
    }),
    "GET"
  );

  workbox.registerRoute(
    /^https:\/\/image\.tmdb\.org\/t\/p\//i,
    new workbox.CacheFirst({
      cacheName: "tmdb-images-v1",
      matchOptions: { ignoreVary: true },
      plugins: [
        new workbox.ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
        {
          handlerDidError: async () => {
            const cache = await caches.open("static-assets-v1");
            return await cache.match("/placeholder.svg");
          }
        }
      ]
    }),
    "GET"
  );
}));
