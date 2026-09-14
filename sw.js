const CACHE_NAME = 'rotinapet-cache-v3';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(() => undefined))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  if(event.request.mode === 'navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCiDk3ERIe8_uVqBhRnFRD5Od8nyLNlLVQ',
  authDomain: 'rotinapet-624a9.firebaseapp.com',
  databaseURL: 'https://rotinapet-624a9-default-rtdb.firebaseio.com',
  projectId: 'rotinapet-624a9',
  storageBucket: 'rotinapet-624a9.appspot.com',
  messagingSenderId: '367302484084',
  appId: '1:367302484084:web:8a5f8b9e6c1d7a8b'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || 'RotinaPet';
  const body = notification.body || data.body || 'Você tem uma novidade na família.';

  return self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    data,
    tag: data.tag || 'rotinapet-fcm',
    renotify: true
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then(list => {
        for(const client of list){
          if('focus' in client){
            client.focus();
            return;
          }
        }
        return clients.openWindow ? clients.openWindow(url) : undefined;
      })
  );
});
