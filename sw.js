// Classroom Tools service worker - cache as you go, works offline after first visit
const VERSION = 'ct-v8';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    try { const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }
    catch { const hit = await c.match(e.request, { ignoreSearch: true }); if (hit) return hit; throw new Error('offline'); }
  }));
});
