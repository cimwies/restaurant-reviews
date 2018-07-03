
const staticCacheName = 'restaurant-static-v1';
const imagesCacheName = 'restaurant-images-v1';

const filesToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/dbhelper.js',
  '/data/restaurants.json'
]

/** 
 * initializing a cache, and cache the App Shell 
 * and static assets using the Cache API 
 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('staticCacheName')
    .then(cache => cache.addAll(filesToCache))
    .catch( err => {
      console.log("Caches open failed: " + err);
    })
  )
});

/**
 * The activation stage is the third step, 
 * once the service worker has been successfully 
 * registered and installed.
 * At this point, the service worker will be able 
 * to work with new page loads. 

/* Cache first strategy and cleaning up old caches 
 * update a Service Worker, and when the register code 
 * is run, it will be updated also cleanup old caches and things 
 * associated with the old version but unused in the new version 
 * of the service worker *
 */
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

/**
 * A fetch event is fired when a resource is requested on the network. 
 */
self.addEventListener('fetch', e => {
  const requestUrl = new URL(e.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === 'index.html') {
      // required if files are in a different directory
      e.respondWith(caches.match('/'));
      return;
    }
  }
  if ((requestUrl.pathname.startsWith('/img/header/')) || (requestUrl.pathname.startsWith('/img/thumbs/'))) {
      e.respondWith(servePhoto(e.request));
      return;
  }

/** 
 * use the Cache API to check if the request URL was already stored
 * in the cached responses, and return the cached response if this is the case.
 * Otherwise, it executes the fetch request and returns it 
 */  
    e.respondWith(
    caches.match(e.request)
    .then( response => {
      return response || fetch(e.request);
    })
  );
});

function servePhoto(request) {
  return caches.open(imagesCacheName)
  .then(cache => {
      return cache.match(request)
      .then(response => (
          response || cacheAndFetch(cache, request)
      ));
  });
}

function cacheAndFetch(cache, request) {
    cache.add(request);
    return fetch(request);
}

self.addEventListener('message', e => {
  if (e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
