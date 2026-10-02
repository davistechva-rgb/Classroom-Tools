// Classroom Tools service worker
// Always asks the server for the newest files first (skipping the browser cache),
// and only uses the saved copy when there is no internet.
const VERSION = 'ct-v18';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  e.respondWith(caches.open(VERSION).then(async c => {
    try {
      const r = same ? await fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : await fetch(e.request);
      if (r.ok || r.type === 'opaque') c.put(e.request, r.clone());
      return r;
    } catch {
      const hit = await c.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      throw new Error('offline');
    }
  }));
});
