// Automatische Erkennung: lokal oder GitHub Pages
const isLocal = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const BASE_PATH = isLocal ? '' : '/SmartDrobeApp';

const CACHE_NAME = "smartdrobe-v1";
const FILES_TO_CACHE = [
  BASE_PATH + "/",
  BASE_PATH + "/index.html",
  BASE_PATH + "/style.css",
  BASE_PATH + "/app.js",
  BASE_PATH + "/config.js",
  BASE_PATH + "/icons/android/android-launchericon-192-192.png",
  BASE_PATH + "/icons/android/android-launchericon-512-512.png",
  BASE_PATH + "/icons/ios/180.png"
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

// Activate Event
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

// Fetch Event
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  
  // Network First für manifest.json
  if (url.pathname.endsWith("/manifest.json")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache First für den Rest
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        console.log("[SW] Fetch fehlgeschlagen, offline");
      })
  );
});
