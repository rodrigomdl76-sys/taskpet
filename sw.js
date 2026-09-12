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
