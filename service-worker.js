const CACHE_NAME = 'prabir-expense-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
  // Note: external CDNs like Chart.js & html2canvas are not listed here.
  // They will be fetched from network and may fail offline unless you host them locally.
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // cache-first strategy for our app shell
  if (evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then((resp) => {
      if (resp) return resp;
      return fetch(evt.request).then((res) => {
        // optionally cache new requests (only same-origin)
        try {
          if (evt.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, res.clone()));
          }
        } catch (e) {}
        return res.clone();
      }).catch(() => {
        // fallback: if request is for page, return cached index.html
        if (evt.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
