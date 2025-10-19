import axios from 'axios';
import { ApiResponse } from '../types/index.js';

// Configuración base del cliente API.
// En desarrollo usa proxy de Vite, en producción usa variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  // Bandera simple para evitar múltiples refresh simultáneos
  isRefreshing = false;
  refreshQueue = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor para agregar el token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log de requests en desarrollo
        if (import.meta.env.DEV) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => Promise.reject(error instanceof Error ? error : new Error('Request error'))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        }
        return response;
      },
      async (error) => this.handleResponseError(error)
    );
  }

  async handleResponseError(error) {
    console.error('Error en response interceptor:', error);
    const originalRequest = error.config || {};
    const status = error.response?.status;

    // Si es un error de red (sin respuesta del servidor), no redirigir al login
    if (!error.response && error.code) {
      console.warn('Error de conexión con el servidor:', error.message);
      // No procesar como 401, permitir que el componente maneje el error
      return Promise.reject(error instanceof Error ? error : new Error('Network error'));
    }

    if (status === 401 && !originalRequest._retry) {
      // Check if this is a JWT validation error (not a missing token)
      const isJwtError = error.response?.data?.message?.includes('Token JWT') ||
                        error.response?.data?.message?.includes('JWT') ||
                        error.response?.data?.error?.includes('JWT') ||
                        error.response?.data?.message?.includes('Signed JWT rejected');

      if (isJwtError) {
        // JWT validation failed - this might be a service configuration issue
        // Don't force logout, just return the error with a user-friendly message
        console.error('JWT validation failed - check service configuration:', error.response?.data);
        const jwtError = new Error('Error de configuración del servicio. Contacte al administrador.');
        jwtError.name = 'JWT_CONFIG_ERROR';
        return Promise.reject(jwtError);
      } else {
        // Missing or expired token - try refresh or logout
        return this.process401(originalRequest, error);
      }
    }
    if (status === 403) {
      console.error('Acceso denegado');
    } else if (status && status >= 500) {
      console.error('Error interno del servidor');
    }
    return Promise.reject(error instanceof Error ? error : new Error('Response error'));
  }

  async process401(originalRequest, originalError) {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) {
      this.forceLogout();
      return Promise.reject(originalError instanceof Error ? originalError : new Error('Unauthorized'));
    }
    originalRequest._retry = true;

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push(() => {
          this.client(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    try {
      this.isRefreshing = true;
      const refreshed = await this.refreshAccessToken(storedRefresh);
      if (refreshed) {
        const result = await this.client(originalRequest);
        this.refreshQueue.forEach(fn => fn());
        this.refreshQueue = [];
        return result;
      }
      this.forceLogout();
      return Promise.reject(new Error('Unable to refresh token'));
    } catch (e) {
      console.error('Fallo al refrescar token', e);
      this.forceLogout();
      return Promise.reject(e instanceof Error ? e : new Error('Refresh failed'));
    } finally {
      this.isRefreshing = false;
    }
  }

  // Refresh del token de acceso
  async refreshAccessToken(refreshToken) {
    try {
      const resp = await this.client.post('/api/auth/refresh', { refreshToken });
      if (resp.data?.success && resp.data.data) {
        const { accessToken, refreshToken: newRefresh, expiresIn } = resp.data.data;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          this.setAuthToken(accessToken);
        }
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
        }
        if (expiresIn) {
          const expiryAt = Date.now() + (expiresIn * 1000) - 60000; // 1 min antes
          localStorage.setItem('tokenExpiryAt', expiryAt.toString());
        }
        return true;
      }
      return false;
    } catch {
      return false; // fallará el refresh y se forzará logout
    }
  }

  forceLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiryAt');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Métodos HTTP principales
  async get(url, config) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put(url, data, config) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch(url, data, config) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(url, config) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Método para upload de archivos
  async upload(url, formData, config) {
    console.log('Uploading file to:', url, formData, config);
    try {
      const response = await this.client.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Manejo centralizado de errores
  handleError(error) {
    if (error.response) {
      // Error con response del servidor
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Error del servidor',
        errors: error.response.data?.errors,
      };
    } else if (error.request) {
      // Error de red
      return {
        success: false,
        error: 'Error de conexión. Verifique su conexión a internet.',
      };
    } else {
      // Error en la configuración de la request
      return {
        success: false,
        error: 'Error inesperado. Inténtelo nuevamente.',
      };
    }
  }

  // Método para obtener la instancia de Axios (si es necesario)
  getInstance() {
    return this.client;
  }

  // Método para actualizar el token
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Método para limpiar el token
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Export por defecto
export default apiClient;
