// TOOL HUB Progressive Web App Service Worker
const IMAGE_CACHE = "toolhub-images-v2";
const MAX_CACHED_IMAGES = 120;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== IMAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheableImage(url) {
  return (
    url.pathname.startsWith("/parts/") ||
    url.pathname.includes("/storage/v1/object/public/product-images/")
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const excess = keys.length - maxEntries;
    await Promise.all(keys.slice(0, excess).map((req) => cache.delete(req)));
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Only intercept static/product images for cache-first delivery.
  // Let HTML navigations and server RPC calls bypass the SW cleanly.
  if (!isCacheableImage(url)) return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone()).then(() => {
          void trimCache(IMAGE_CACHE, MAX_CACHED_IMAGES);
        });
      }
      return response;
    }),
  );
});
