/**
 * Servce worker script.
 */
let staticCacheName = 'restaurant-static-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('staticCacheName')
    .then( cache =>  {
      return cache.addAll([
        '/restaurant-reviews',
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/data/restaurants.json'
      ])
      .catch( err => {
        console.log("Caches open failed: " + err);
      });
    })
  );
});


/* Cache first strategy and cleaning up old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
    .then( cachesNames => {
      return Promise.all(
        cachesNames.filter( cacheName => {
          return cacheName.startsWith('restaurant-') &&
                 cacheName != staticCacheName;
        }).map( cacheName => {
          return caches.delete(cacheName);
       })
      );
    })
  );
});

/* What resouces to fetch and fallback solution*/
self.addEventListener('fetch', e => {
  let requestUrl = new URL(e.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      // if path is root stay in root - not necessary?
      e.respondWith(caches.match('/'));
      return;
    }
  }
  e.respondWith(
    caches.match(e.request)
    .then( response => {
      return response || fetch(e.request);
    })
  );
});

/* Speed up install and activate */
self.addEventListener('message', e => {
  if (e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
