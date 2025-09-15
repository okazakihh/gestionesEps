import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// Configuración base del cliente API.
// Temporalmente apuntando directamente al backend para solucionar problemas de proxy
const API_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : (import.meta.env.VITE_API_URL || 'http://localhost:8081');

class ApiClient {
  private readonly client: AxiosInstance;
  // Bandera simple para evitar múltiples refresh simultáneos
  private isRefreshing: boolean = false;
  private refreshQueue: Array<() => void> = [];

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

  private setupInterceptors(): void {
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
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        }
        return response;
      },
      async (error) => this.handleResponseError(error)
    );
  }

  private async handleResponseError(error: any) {
    console.error('Error en response interceptor:', error);
    const originalRequest: any = error.config || {};
    const status = error.response?.status;

    // Si es un error de red (sin respuesta del servidor), no redirigir al login
    if (!error.response && error.code) {
      console.warn('Error de conexión con el servidor:', error.message);
      // No procesar como 401, permitir que el componente maneje el error
      return Promise.reject(error instanceof Error ? error : new Error('Network error'));
    }

    if (status === 401 && !originalRequest._retry) {
      return this.process401(originalRequest, error);
    }
    if (status === 403) {
      console.error('Acceso denegado');
    } else if (status && status >= 500) {
      console.error('Error interno del servidor');
    }
    return Promise.reject(error instanceof Error ? error : new Error('Response error'));
  }

  private async process401(originalRequest: any, originalError: any) {
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
  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      const resp = await this.client.post<ApiResponse<any>>('/auth/refresh', { refreshToken });
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

  private forceLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiryAt');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Métodos HTTP principales
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Método para upload de archivos
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
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
  private handleError(error: any): ApiResponse<any> {
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
  getInstance(): AxiosInstance {
    return this.client;
  }

  // Método para actualizar el token
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Método para limpiar el token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Export por defecto
export default apiClient;
