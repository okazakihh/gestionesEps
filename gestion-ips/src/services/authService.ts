import { apiClient } from '@/api/apiClient';

// Interfaces específicas para el servicio de auth (mapeadas a la respuesta real del backend)
export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface BackendAuthResponse {
  token: string;
  user: any; // guardamos la estructura completa que devuelve el backend
}

export class AuthService {
  /**
   * Realiza el login del usuario. El backend retorna { token, user } dentro de data.
   */
  static async login(credentials: AuthLoginRequest): Promise<BackendAuthResponse> {
    const response = await apiClient.post<BackendAuthResponse>('/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error en el login');
    }
    return response.data;
  }

  /**
   * Realiza el logout del usuario
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Error en logout del backend:', error);
      // Continúa con el logout local aunque falle el backend
    }
  }

  /**
   * Refresca el token de autenticación
   */
  static async refreshToken(refreshToken: string): Promise<any> {
    const response = await apiClient.post<any>('/auth/refresh', { refreshToken });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al refrescar token');
    }
    return response.data;
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getProfile(): Promise<any> {
    const response = await apiClient.get<any>('/auth/profile');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener perfil');
    }
    return response.data;
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Error al cambiar contraseña');
    }
  }
}

export default AuthService;
