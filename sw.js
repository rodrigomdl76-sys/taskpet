const CACHE_NAME = 'rotinapet-cache-v42';
const RUNTIME_CACHE_NAME = 'rotinapet-media-v3';
const KEEP_CACHES = new Set([CACHE_NAME, RUNTIME_CACHE_NAME]);
const MAX_RUNTIME_ENTRIES = 100;
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.webp?v=cat-crown-v1",
  "./icon-192.png?v=cat-crown-v2",
  "./icon-512.webp?v=cat-crown-v1",
  "./icon-512-maskable.webp?v=cat-crown-v1",
  "./css/14_pet_companheiro.css?v=5",
  "./css/01_base.css?v=layout-ref-v1",
  "./js/01_menu.js?v=back-3",
  "./css/02_menu.css",
  "./css/03_mapa_album.css",
  "./css/04_animacoes_pet.css?v=efeitos-reacoes-v1",
  "./css/05_evolucao_pet.css",
  "./css/13_gato_laranja.css?v=pet-stage-align-v1",
  "./third_party/qrcode-generator/qrcode.js?v=local-qrcode-v1",
  "./js/02_principal.js?v=catalogo-gato-axolote-v1",
  "./js/03_extras_01.js",
  "./js/04_engajamento.js?v=mesada-tarefas-v1",
  "./css/06_extras_01.css",
  "./js/05_interface.js",
  "./css/07_extras_02.css",
  "./css/08_interface.css",
  "./css/09_album.css?v=album-paginas-v1",
  "./js/14_figurinhas_artes_ovo.js?v=1",
  "./js/15_figurinhas_artes_cinza.js?v=1",
  "./js/06_premium.js?v=album-art-v2",
  "./css/10_premium_62.css",
  "./js/07_mapa_album.js?v=album-art-v1",
  "./css/11_premium_63.css",
  "./css/12_mapa_vivo.css",
  "./js/08_meu_pet.js?v=gestos-1",
  "./js/09_gato_laranja.js?v=ovo-animacoes-v16",
  "./js/10_pet_companheiro.js?v=6",
  "./css/17_pet_no_chao.css?v=2",
  "./css/18_topo_limpo.css?v=seletor-pet-v1",
  "./css/19_plataforma_pet.css?v=1",
  "./css/16_evolucao_interativa.css?v=1",
  "./css/20_palcos.css?v=2",
  "./css/21_home_v2.css?v=seletor-pet-v1",
  "./css/23_axolote.css?v=1",
  "./css/24_atelie_pet.css?v=2",
  "./js/12_home_nav.js?v=2",
  "./css/22_gestos.css?v=5",
  "./js/13_gestos.js?v=4",
  "./js/16_axolote.js?v=axolote-fase3-v1",
  "./js/17_atelie_pet.js?v=3"
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(ASSETS.map(async asset => {
      try { await cache.add(asset); }
      catch (error) { console.warn('Não foi possível pré-carregar:', asset, error); }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => !KEEP_CACHES.has(key))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function limitarCacheMidia(cache) {
  const chaves = await cache.keys();
  while (chaves.length > MAX_RUNTIME_ENTRIES) {
    await cache.delete(chaves.shift());
  }
}

function buscarEGuardarMidia(request, event) {
  const cachePromise = caches.open(RUNTIME_CACHE_NAME);
  const existentePromise = cachePromise.then(cache => cache.match(request));

  const atualizarPromise = existentePromise.then(async existente => {
    const cache = await cachePromise;
    try {
      if (existente) {
        await cache.delete(request);
        await cache.put(request, existente.clone());
      }

      const resposta = await fetch(new Request(request, {cache: 'no-cache'}));
      if (resposta.ok && resposta.type === 'basic') {
        await cache.put(request, resposta.clone());
        await limitarCacheMidia(cache);
      }
      return existente || resposta;
    } catch (error) {
      if (existente) return existente;
      console.warn('Não foi possível atualizar a mídia em cache:', request.url, error);
      return caches.match(request);
    }
  });

  event.waitUntil(atualizarPromise.then(() => undefined).catch(error => {
    console.warn('Falha ao atualizar o cache de mídia:', error);
  }));

  return existentePromise
    .then(existente => existente || atualizarPromise)
    .then(resposta => resposta || caches.match(request))
    .then(resposta => resposta || Response.error());
}
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  if (url.pathname.includes('/animacoes/') || url.pathname.includes('/assets/')) {
    event.respondWith(buscarEGuardarMidia(event.request, event));
    return;
  }

  event.respondWith(
    (async () => {
      // Arquivos do app vão primeiro à rede para evitar que uma implantação
      // deixe JavaScript ou CSS antigo preso no cache do celular.
      try {
        const response = await fetch(new Request(event.request, { cache: 'no-cache' }));
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        return cached || Response.error();
      }
    })()
  );
});

// Firebase Cloud Messaging — mantém a mesma configuração de js/02_principal.js.
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCiDk3ERIe8_uVqBhRnFRD5Od8nyLNlLVQ',
  authDomain: 'rotinapet-624a9.firebaseapp.com',
  databaseURL: 'https://rotinapet-624a9-default-rtdb.firebaseio.com',
  projectId: 'rotinapet-624a9',
  storageBucket: 'rotinapet-624a9.firebasestorage.app',
  messagingSenderId: '218579871240',
  appId: '1:218579871240:web:c681389aacd70f677693bd'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || 'RotinaPet';
  const body = notification.body || data.body || 'Você tem uma novidade na família.';

  return self.registration.showNotification(title, {
    body,
    icon: './icon-192.webp?v=cat-crown-v1',
    badge: './icon-192.webp?v=cat-crown-v1',
    data,
    tag: data.tag || 'rotinapet-fcm',
    renotify: true
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const scope = new URL(self.registration.scope);
  let destino;
  try {
    destino = new URL(event.notification.data?.url || './', scope);
  } catch (error) {
    destino = scope;
  }
  if (destino.origin !== scope.origin || !destino.pathname.startsWith(scope.pathname)) {
    destino = scope;
  }

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then(async lista => {
        const janela = lista.find(client => {
          try {
            const url = new URL(client.url);
            return url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
          } catch (error) {
            return false;
          }
        });
        if (janela) {
          try {
            if ('navigate' in janela) await janela.navigate(destino.href);
          } catch (error) {
            console.warn('Não foi possível navegar para a notificação:', error);
          }
          return janela.focus();
        }
        return clients.openWindow ? clients.openWindow(destino.href) : undefined;
      })
  );
});
