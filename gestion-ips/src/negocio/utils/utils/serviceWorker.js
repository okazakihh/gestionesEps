// Utilidades para Service Worker en Gestión IPS

// Registrar Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado correctamente:', registration.scope);

      // Manejar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              showUpdateNotification();
            }
          });
        }
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache actualizado:', event.data.payload);
        }
      });

      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  } else {
    console.warn('Service Worker no soportado en este navegador');
    return null;
  }
};

// Mostrar notificación de actualización
const showUpdateNotification = () => {
  // Crear notificación personalizada
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h4 class="font-semibold">Actualización Disponible</h4>
        <p class="text-sm">Nueva versión de la aplicación lista</p>
      </div>
      <div class="flex space-x-2 ml-4">
        <button id="update-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
          Actualizar
        </button>
        <button id="dismiss-btn" class="text-white hover:text-gray-200 text-sm">
          ×
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Event listeners
  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
};

// Limpiar cache manualmente
export const clearCache = async () => {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      console.log('Solicitud de limpieza de cache enviada');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error limpiando cache:', error);
    return false;
  }
};

// Verificar estado del cache
export const getCacheStatus = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheSizes = await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          return {
            name: cacheName,
            size: keys.length,
            urls: keys.map(request => request.url)
          };
        })
      );

      return {
        available: true,
        caches: cacheSizes,
        totalCaches: cacheNames.length
      };
    }

    return {
      available: false,
      caches: [],
      totalCaches: 0
    };
  } catch (error) {
    console.error('Error obteniendo estado del cache:', error);
    return {
      available: false,
      error: error.message
    };
  }
};

// Forzar actualización del Service Worker
export const updateServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('Service Worker actualizado');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error actualizando Service Worker:', error);
    return false;
  }
};

// Obtener información del Service Worker
export const getServiceWorkerInfo = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const controller = navigator.serviceWorker.controller;

      return {
        registered: true,
        scope: registration.scope,
        state: registration.active?.state,
        scriptURL: registration.active?.scriptURL,
        hasController: !!controller,
        lastUpdate: registration.active?.scriptURL ? new Date() : null
      };
    }

    return {
      registered: false,
      reason: 'Service Worker no soportado'
    };
  } catch (error) {
    return {
      registered: false,
      error: error.message
    };
  }
};

// Hook personalizado para Service Worker
import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const initSW = async () => {
      const registration = await registerServiceWorker();
      setIsRegistered(!!registration);
    };

    initSW();

    // Escuchar cambios de conectividad
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isRegistered,
    isOnline,
    clearCache,
    getCacheStatus,
    updateServiceWorker,
    getServiceWorkerInfo
  };
};