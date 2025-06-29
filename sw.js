/* =========================================================
   SERVICE-WORKER  –  offline & update-friendly
   ---------------------------------------------------------
   • Shell files are precached once at install.
   • All other requests use   network-first → cache.
   • No manual version bumps ever required.
   =======================================================*/

/* ---------- 1.  EDIT THESE SHELL FILES IF NEEDED -------- */
const SHELL = [
  './',                  // index.html
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
  /* add extra CSS/JS that rarely change here */
];

/* ---------- 2.  CACHE NAMES (rarely change) ------------- */
const PRECACHE   = 'program-shell-v1';
const RUNTIME    = 'program-runtime';

/* ---------- 3.  INSTALL – cache the shell --------------- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();            // activate immediately
});

/* ---------- 4.  ACTIVATE – clean old caches ------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => ![PRECACHE,RUNTIME].includes(k))
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ---------- 5.  FETCH – network-first runtime cache ----- */
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(req).then(resp => {
      // Successful? – clone & save in RUNTIME
      const copy = resp.clone();
      caches.open(RUNTIME).then(c => c.put(req, copy));
      return resp;
    }).catch(() =>
      // Network failed – fall back to cache
      caches.match(req)
    )
  );
});
