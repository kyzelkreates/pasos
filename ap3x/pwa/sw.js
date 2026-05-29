// AP3X — Service Worker
// Migrated from BCO pwa/bco-sw.js
// Caches core app shell for offline use.

const CACHE_NAME = "ap3x-v1";

const PRECACHE = [
  "/",
  "/index.html",
  "/ui/app.css",
  "/index.js",
  "/pwa/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
