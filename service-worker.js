const CACHE_NAME = "pwa-demo-v2";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/icons/android/android-launchericon-192-192.png",
  "/icons/android/android-launchericon-512-512.png",
  "/icons/ios/180.png"
];

// Install Event
self.addEventListener("install", event => {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[SW] Caching app shell");
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Alte Caches löschen
self.addEventListener("activate", event => {
  console.log("[SW] Activate");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Lösche alten Cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First für manifest.json, Cache First für den Rest
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  
  // Network First für manifest.json (damit Updates ankommen)
  if (url.pathname === "/manifest.json") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Erfolgreiche Antwort cachen
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Fallback auf Cache bei Netzwerkfehler
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache First für alle anderen Requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Nicht im Cache, vom Netzwerk holen
        return fetch(event.request).then(response => {
          // Nur erfolgreiche Antworten cachen
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          // Response klonen und cachen
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Offline-Fallback (optional: eigene Offline-Seite)
        console.log("[SW] Fetch fehlgeschlagen, offline");
      })
  );
});