/**
 * Servicio de API para gestión de Roles
 * Capa de Datos - Servicios
 * 
 * Este servicio maneja todas las operaciones CRUD relacionadas con
 * los roles del sistema a través del Gateway.
 */

import { apiClient } from '../api/apiClient.js';

// Base URL for roles service - using Gateway
const ROLES_BASE_URL = '/api/roles';

/**
 * Roles API Service
 * Proporciona métodos para interactuar con el backend de roles
 */
export const roleApiService = {
  /**
   * Obtener todos los roles (paginado)
   * @param {Object} params - Parámetros de paginación (page, size)
   * @returns {Promise<Object>} Página de roles
   */
  getRoles: async (params = { page: 0, size: 10 }) => {
    const response = await apiClient.get(ROLES_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener roles');
    }
    return response.data;
  },

  /**
   * Obtener todos los roles (lista completa sin paginar)
   * @returns {Promise<Array>} Lista de todos los roles
   */
  getAllRoles: async () => {
    const response = await apiClient.get(`${ROLES_BASE_URL}/all`);
    if (!response.success) {
      const error = new Error(response.error || 'Error al obtener roles');
      error.statusCode = response.statusCode;
      throw error;
    }
    return response.data;
  },

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} Datos del rol
   */
  getRoleById: async (id) => {
    const response = await apiClient.get(`${ROLES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener rol');
    }
    return response.data;
  },

  /**
   * Obtener rol por nombre
   * @param {string} name - Nombre del rol
   * @returns {Promise<Object>} Datos del rol
   */
  getRoleByName: async (name) => {
    const response = await apiClient.get(`${ROLES_BASE_URL}/nombre/${name}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener rol por nombre');
    }
    return response.data;
  },

  /**
   * Crear nuevo rol
   * @param {Object} roleData - Datos del rol a crear
   * @returns {Promise<Object>} Rol creado
   */
  createRole: async (roleData) => {
    const response = await apiClient.post(ROLES_BASE_URL, roleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear rol');
    }
    return response.data;
  },

  /**
   * Actualizar rol existente
   * @param {number} id - ID del rol
   * @param {Object} roleData - Datos actualizados del rol
   * @returns {Promise<Object>} Rol actualizado
   */
  updateRole: async (id, roleData) => {
    const response = await apiClient.put(`${ROLES_BASE_URL}/${id}`, roleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar rol');
    }
    return response.data;
  },

  /**
   * Eliminar rol
   * @param {number} id - ID del rol
   * @returns {Promise<void>}
   */
  deleteRole: async (id) => {
    const response = await apiClient.delete(`${ROLES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar rol');
    }
  },

  /**
   * Verificar si existe un rol por nombre
   * @param {string} name - Nombre del rol
   * @returns {Promise<boolean>} True si existe, false si no
   */
  existsByName: async (name) => {
    const response = await apiClient.get(`${ROLES_BASE_URL}/exists/${name}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al verificar rol');
    }
    return response.data;
  }
};

export default roleApiService;
