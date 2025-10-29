// Service Worker para Gestión IPS - Optimización de Facturación
const CACHE_NAME = 'gestion-ips-v1.0.0';
const API_CACHE_NAME = 'gestion-ips-api-v1.0.0';

// Recursos a cachear
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// APIs a cachear
const API_ENDPOINTS = [
  '/api/codigos-cups',
  '/api/empleados',
  '/api/pacientes',
  '/api/citas'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando recursos estáticos...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error durante la instalación:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activado correctamente');
      return self.clients.claim();
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache para APIs de facturación
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Si hay respuesta en cache, devolverla
          if (cachedResponse) {
            console.log('Respuesta desde cache:', request.url);
            return cachedResponse;
          }

          // Si no está en cache, hacer request y cachear
          return fetch(request).then((networkResponse) => {
            // Solo cachear respuestas exitosas
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
              console.log('Respuesta cacheada:', request.url);
            }
            return networkResponse;
          }).catch((error) => {
            console.error('Error en request API:', error);
            // Si falla la red y tenemos cache, devolver cache obsoleto
            if (cachedResponse) {
              console.log('Devolviendo cache obsoleto por falla de red:', request.url);
              return cachedResponse;
            }
            throw error;
          });
        });
      })
    );
  }
  // Cache para recursos estáticos
  else if (STATIC_CACHE_URLS.includes(url.pathname) || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cachear recursos estáticos
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

// Manejar mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      console.log('Cache de API limpiado');
    });
  }
});

// Estrategia de cache para datos de facturación
const cacheFacturacionData = async (request) => {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Verificar si el cache es reciente (menos de 5 minutos)
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
    const now = new Date();
    const cacheAge = now - cacheTime;

    if (cacheAge < 5 * 60 * 1000) { // 5 minutos
      console.log('Usando cache reciente para:', request.url);
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Agregar timestamp al cache
      const responseClone = networkResponse.clone();
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-time': new Date().toISOString()
        }
      });

      cache.put(request, responseWithTimestamp);
      console.log('Datos de facturación cacheados:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('Error cacheando datos de facturación:', error);
    // Devolver cache obsoleto si existe
    if (cachedResponse) {
      console.log('Devolviendo cache obsoleto:', request.url);
      return cachedResponse;
    }
    throw error;
  }
};

// Limpiar cache periódicamente
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'clear-old-cache') {
    event.waitUntil(
      clearOldCache()
    );
  }
});

const clearOldCache = async () => {
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();

  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  await Promise.all(
    keys.map(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = new Date(response.headers.get('sw-cache-time') || 0);
        if (cacheTime < oneHourAgo) {
          await cache.delete(request);
          console.log('Cache obsoleto eliminado:', request.url);
        }
      }
    })
  );
};