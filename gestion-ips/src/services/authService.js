import { apiClient } from '@/api/apiClient.js';

export class AuthService {
  /**
   * Realiza el login del usuario. El backend retorna { token, user } dentro de data.
   */
  static async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error en el login');
    }
    return response.data;
  }

  /**
   * Realiza el logout del usuario
   */
  static async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('Error en logout del backend:', error);
      // Continúa con el logout local aunque falle el backend
    }
  }

  /**
   * Refresca el token de autenticación
   */
  static async refreshToken(refreshToken) {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al refrescar token');
    }
    return response.data;
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getProfile() {
    const response = await apiClient.get('/api/auth/profile');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener perfil');
    }
    return response.data;
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  static async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });

    if (!response.success) {
      throw new Error(response.error || 'Error al cambiar contraseña');
    }
  }

  /**
   * Registra un nuevo usuario
   */
  static async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData);
    if (!response.success) {
      throw new Error(response.error || 'Error al registrar usuario');
    }
    return response.data;
  }
}

export default AuthService;
