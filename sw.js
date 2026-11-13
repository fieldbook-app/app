// ICON Montaj — офлайн и автообновление. Версия меняется при каждой сборке.
const V = 'icon-99b95defea';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;   // Google-сервер не кэшируем
  if (r.mode === 'navigate') {
    // Сначала сайт (свежая версия), если за 3 с нет ответа или нет сети — сохранённая копия
    e.respondWith(new Promise(function (resolve) {
      let done = false;
      const fallback = function () { if (done) return; done = true; caches.match('./index.html').then(function (c) { resolve(c || fetch(r)); }); };
      const t = setTimeout(fallback, 3000);
      fetch('./index.html', { cache: 'no-cache' }).then(function (res) {
        if (!res || !res.ok) return fallback();
        const copy = res.clone(); caches.open(V).then(function (c) { c.put('./index.html', copy); });
        clearTimeout(t); if (!done) { done = true; resolve(res); }
      }).catch(fallback);
    }));
    return;
  }
  // значки, манифест: из сохранённой копии, в фоне обновляем
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (c) {
    const net = fetch(r, { cache: 'no-cache' }).then(function (res) { if (res && res.ok) { const cp = res.clone(); caches.open(V).then(function (k) { k.put(r, cp); }); } return res; }).catch(function () { return c; });
    return c || net;
  }));
});
