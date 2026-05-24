// 成语Quiz 250 — Service Worker
// Cache version: bump this string whenever you deploy a new version of index.html
const CACHE = 'chengyu-v1';

// Files to pre-cache on install
const PRECACHE = [
  '/ChengYuQuiz/',
  '/ChengYuQuiz/index.html'
];

// Install: pre-cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML (always get latest quiz data),
// cache-first for everything else
self.addEventListener('fetch', e => {
  const req = e.request;
  // Only handle GET requests on our origin
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  if (req.destination === 'document') {
    // Network-first for HTML pages — ensures updated idiom data is always fresh
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache-first for assets
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});
