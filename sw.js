// ICON Montaj — офлайн и автообновление. Версия меняется при каждой сборке.
const V = 'icon-99b95defea';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;   // Google-сервер не кэшируем
  if (r.mode === 'navigate') { e.respondWith(caches.match('./index.html').then(function (c) { return c || fetch(r); })); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (c) { return c || fetch(r); }));
});
