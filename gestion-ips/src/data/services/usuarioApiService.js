import { apiClient } from '@/data/api/apiClient';
import { Usuario } from '@/presentacion/types/index.js';

class UsuarioApiService {
  constructor() {
    this.baseUrl = '/api/users';
  }

  // Obtener todos los usuarios
  async getAllUsuarios() {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return {
        success: false,
        error: 'Error al obtener la lista de usuarios'
      };
    }
  }

  // Obtener usuario por ID
  async getUsuarioById(id) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return {
        success: false,
        error: 'Error al obtener el usuario'
      };
    }
  }

  // Obtener usuario por email/username
  async getUsuarioByEmail(email) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/email/${email}`);
      return response;
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      return {
        success: false,
        error: 'Error al obtener el usuario'
      };
    }
  }

  // Crear usuario
  async createUsuario(usuario) {
    try {
      const response = await apiClient.post(this.baseUrl, usuario);
      return response;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return {
        success: false,
        error: 'Error al crear el usuario'
      };
    }
  }

  // Actualizar usuario
  async updateUsuario(id, usuario) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, usuario);
      return response;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        error: 'Error al actualizar el usuario'
      };
    }
  }

  // Eliminar usuario
  async deleteUsuario(username) {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${username}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return {
        success: false,
        error: 'Error al eliminar el usuario'
      };
    }
  }
}

export const usuarioApiService = new UsuarioApiService();
export default usuarioApiService;
