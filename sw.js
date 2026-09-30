const CACHE = "charm21-v2";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "notify.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first so content updates land; fall back to cache offline (fonts included).
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

// Push from the GitHub Actions sender: { title, body, go, tag }
self.addEventListener("push", e => {
  let m = {};
  try { m = e.data.json(); } catch { m = { title: "Charm 21", body: e.data?.text() || "" }; }
  e.waitUntil(
    self.registration.showNotification(m.title || "Charm 21", {
      body: m.body,
      tag: m.tag,
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      data: { go: m.go || "now" },
    })
  );
});

// Tapping a notification opens the app at the right section.
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const go = e.notification.data?.go || "now";
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if ("focus" in w) { await w.focus(); w.postMessage({ go }); return; }
    }
    await self.clients.openWindow(`./?go=${go}`);
  })());
});
