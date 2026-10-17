/* ============================================================
   Service Worker — تخزين مؤقت ذكي لموقع شركة ميم
   ============================================================ */

const CACHE_VERSION = 'meem-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/catalog-data.js',
  './js/script.js',
  './js/gallery-features.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png',
  './service-worker.js',
];

/* ---------- Install ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

/* ---------- Activate ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------- Fetch ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // تجاهل طلبات Supabase و Google Fonts
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('fonts.googleapis.com')) return;
  if (url.hostname.includes('fonts.gstatic.com')) return;

  // الصور: Cache First
  if (request.destination === 'image' || /\.(png|jpe?g|webp|svg|gif)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) =>
          cached || fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached)
        )
      )
    );
    return;
  }

  // HTML/CSS/JS: Network First مع fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
  );
});