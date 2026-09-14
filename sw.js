const CACHE_NAME = 'taskpet-cache-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  // Ativa a nova versão imediatamente, sem esperar todas as abas antigas fecharem.
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  // Apaga caches de versões antigas (ex.: taskpet-cache-v1) e assume o controle
  // das abas já abertas na hora, sem precisar fechar e reabrir o app.
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // A página principal (HTML) sempre busca a versão mais nova do servidor primeiro.
  // Só usa a copia salva em cache se o aparelho estiver sem internet.
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copia));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Para os outros arquivos (CSS, ícones, etc.), cache primeiro está bom, já que
  // mudam bem menos e isso deixa o app mais rápido para abrir.
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
/* RotinaPet — Service Worker de mensagens FCM (background push)
 * Deve ficar na MESMA origem do app (ex.: raiz do GitHub Pages).
 * Carrega o SDK compat do Firebase Messaging.
 */
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

// Notificação quando o app está em background / fechado
messaging.onBackgroundMessage(function (payload) {
  const data = (payload && payload.data) || {};
  const title =
    (payload.notification && payload.notification.title) ||
    data.title ||
    '🐾 RotinaPet';
  const body =
    (payload.notification && payload.notification.body) ||
    data.body ||
    'Você tem uma novidade na família.';
  const options = {
    body: body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: data,
    tag: data.tag || 'rotinapet-fcm',
    renotify: true
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const client of list) {
        if (client.url && 'focus' in client) {
          client.focus();
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
