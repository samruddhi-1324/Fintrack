const CACHE_NAME = 'fintrack-v3';
const DYNAMIC_CACHE = 'fintrack-dynamic-v3';

const STATIC_ASSETS = [
  '/',
  '/expenses',
  '/categories',
  '/budgets',
  '/offline',
  '/favicon.ico?v=3',
  '/apple-touch-icon.png?v=3',
  '/android-chrome-192x192.png?v=3',
  '/android-chrome-512x512.png?v=3',
  '/icons/icon-48.png?v=3',
  '/icons/icon-72.png?v=3',
  '/icons/icon-96.png?v=3',
  '/icons/icon-128.png?v=3',
  '/icons/icon-144.png?v=3',
  '/icons/icon-192.png?v=3',
  '/icons/icon-192-maskable.png?v=3',
  '/icons/icon-384.png?v=3',
  '/icons/icon-512.png?v=3',
  '/icons/icon-512-maskable.png?v=3'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or browser extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle API Requests: Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Handle Page Navigation (HTML): Network First with Cache & Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline fallback page
          const offlinePage = await caches.match('/offline');
          return offlinePage || new Response('Offline mode active. Please reconnect to access FinTrack.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, Images, Fonts): Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
