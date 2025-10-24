// sw.js - Service Worker para ESCOLOGIA PWA
// Versión: v1.0.2 - Con "escape hatch" para Google Maps
// Versión: v1.0.3 - Mejoras en Dashboard- Home- Instalacion PWA- archivos instalacion
//Correccion Bug instalacion y error en sw bloquea apikey de maps 
//mejora responsibilidad en home
//mejora al home
// Versión: v1.0.31 - Mejora en reportes datos exportables (Funcion implementada pendiente a testing)

const VERSION = "v1.0.3";
const APP_CACHE_NAME = `escolegia-${VERSION}`;

// ✅ Archivos principales del sitio
const APP_SHELL = [
  '/',
  '/index.html',
  '/home.html',
  '/foro.html',
  '/mapa-colaborativo.html',
  '/perfil-escuela.html',
  '/publicacion-proyectos.html',
  '/panel-administrativo.html',
  '/reportes.html',
  '/juegos.html',
  '/styles.css',
  '/home.js',
  '/foro.js',
  '/manifest.json',
  '/public/img/favicon.ico', // Asegúrate que esta ruta sea correcta
  '/offline.html' // Página de respaldo
];

// 🌐 Recursos externos
const APP_SHELL_INTERNET = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// 🛠️ INSTALACIÓN DEL SERVICE WORKER
self.addEventListener('install', event => {
  console.log('SW: Instalando Service Worker...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE_NAME);
      console.log('SW: Cache abierto ->', APP_CACHE_NAME);

      const resources = [...APP_SHELL, ...APP_SHELL_INTERNET];
      for (const url of resources) {
        try {
          // Usamos 'no-cache' para asegurar que obtenemos la versión fresca durante la instalación
          const response = await fetch(url, { cache: "no-cache" }); 
          if (response.ok) {
            await cache.put(url, response);
          } else {
            console.warn(`SW: ❌ No se pudo cachear (respuesta inválida): ${url}`);
          }
        } catch (error) {
          console.warn(`SW: ⚠️ Error al cachear: ${url}`, error.message);
        }
      }
      self.skipWaiting();
      console.log('SW: Instalación completada ✅');
    })()
  );
});

// 🔁 ACTIVACIÓN DEL SERVICE WORKER
self.addEventListener('activate', event => {
  console.log('SW: Activando y limpiando versiones antiguas...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== APP_CACHE_NAME) {
            console.log('SW: 🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediato
  );
});

// 🌐 INTERCEPTACIÓN DE PETICIONES (FETCH)
self.addEventListener('fetch', event => {
  // Solo manejamos peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ----------------------------------------------------
  // ✅ INICIO DE LA CORRECCIÓN: IGNORAR GOOGLE MAPS Y APIS
  // ----------------------------------------------------
  if (url.hostname === 'maps.googleapis.com' || 
      url.hostname === 'maps.gstatic.com' ||
      url.hostname === 'api.openweathermap.org' // También vi esta en tus logs
  ) {
    console.log('SW: 🛑 Ignorando API externa, yendo solo a la red:', event.request.url);
    // No usamos event.respondWith(), dejamos que el navegador la maneje.
    return; 
  }
  // ----------------------------------------------------
  // FIN DE LA CORRECCIÓN
  // ----------------------------------------------------


  // Estrategia: Cache, luego Network (para el resto de tus archivos)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en caché, úsalo
        if (response) {
          console.log('SW: 🗂️ Sirviendo desde cache:', event.request.url);
          return response;
        }

        // Si no está, intenta obtenerlo de la red
        console.log('SW: 🌍 Buscando en la red:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            
            // Si la respuesta es válida (solo de nuestro propio origen)
            if (networkResponse && networkResponse.status === 200 && url.origin === self.origin) {
              const responseToCache = networkResponse.clone();
              caches.open(APP_CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            // Si la red falla, muestra la página offline
            console.warn('SW: 🚫 Falla de red, usando offline.html para:', event.request.url);
            return caches.match('/offline.html');
          });
      })
  );
});

// 💬 ESCUCHAR MENSAJES DESDE LA APP
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});