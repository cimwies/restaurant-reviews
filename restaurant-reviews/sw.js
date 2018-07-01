
let staticCacheName = 'restaurant-static-v1';

/** 
 * initializing a cache, and cache the App Shell 
 * and static assets using the Cache API 
 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('staticCacheName')
    .then( cache =>  {
      return cache.addAll([
        '/',
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
  let requestUrl = new URL(e.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      // if path is root stay in root - not necessary?
      e.respondWith(caches.match('/'));
      return;
    }
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

/**
 * Speed up install and activate 
 */
self.addEventListener('message', e => {
  if (e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});


/**
 * the service worker can listen for incoming push events:
 */
self.addEventListener('push', (event) => {
  console.log('Received a push event', event)

  const options = {
    title: 'I got a message for you!',
    body: 'Here is the body of the message',
    icon: '/img/favicon-32x32.png',
    tag: 'tag-for-this-notification',
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})