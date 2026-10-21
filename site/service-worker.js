/* ============================================================
   Service Worker — تخزين مؤقت لموقع شركة ميم
   - الصور: Cache First   - الصفحات/CSS/JS: Network First
   - لوحة الإدارة وSupabase والخطوط: بدون تخزين
   غيّر CACHE_VERSION عند كل إصدار جديد.
   ============================================================ */
const CACHE_VERSION = "meem-v5";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css",
  "./js/config.js", "./js/supabase.js", "./js/catalog.js", "./js/app.js", "./js/tracking.js", "./js/features.js",
  "./images/brand/logo-mark.svg", "./images/brand/icon-192.png", "./images/brand/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;          // Supabase / Google Fonts / أي نطاق خارجي
  if (url.pathname.includes("/admin/")) return;              // لوحة الإدارة ما تتخزنش أبدًا

  if (request.destination === "image" || /\.(png|jpe?g|webp|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) =>
          cached || fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached),
        ),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html"))),
  );
});
