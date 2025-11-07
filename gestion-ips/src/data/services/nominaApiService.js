/**
 * nominaApiService.js
 * 
 * Servicio para consumir las APIs de Nómina del microservicio administrative
 * 
 * Endpoints disponibles:
 * - POST   /nomina/empleado/{empleadoId} - Crear nómina
 * - GET    /nomina/{id} - Obtener nómina por ID
 * - GET    /nomina - Obtener nóminas activas (paginado)
 * - GET    /nomina/empleado/{empleadoId} - Obtener nóminas por empleado
 * - PUT    /nomina/{id} - Actualizar nómina
 * - PATCH  /nomina/{id}/desactivar - Desactivar nómina
 * - DELETE /nomina/{id} - Eliminar nómina
 * 
 * Capa: Datos (Data Layer)
 */

import { apiClient } from '../api/apiClient.js';

const NOMINA_BASE_URL = '/administrative/nomina';

/**
 * Servicio de API para gestión de nóminas
 */
export const nominaApiService = {
  /**
   * Crea una nueva nómina para un empleado
   * @param {number} empleadoId - ID del empleado
   * @param {Object} nominaData - Datos de la nómina (se convertirá a JSON)
   * @returns {Promise<Object>} Nómina creada
   */
  createNomina: async (empleadoId, nominaData) => {
    const response = await apiClient.post(
      `${NOMINA_BASE_URL}/empleado/${empleadoId}`,
      JSON.stringify(nominaData),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al crear nómina');
    }

    return response.data;
  },

  /**
   * Obtiene una nómina por su ID
   * @param {number} id - ID de la nómina
   * @returns {Promise<Object>} Datos de la nómina
   */
  getNominaById: async (id) => {
    const response = await apiClient.get(`${NOMINA_BASE_URL}/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Error al obtener nómina');
    }

    return response.data;
  },

  /**
   * Obtiene nóminas activas con paginación
   * @param {Object} params - Parámetros de paginación (page, size)
   * @returns {Promise<Object>} Página de nóminas activas
   */
  getNominasActivas: async (params = {}) => {
    const { page = 0, size = 10 } = params;

    const response = await apiClient.get(NOMINA_BASE_URL, {
      params: { page, size }
    });

    if (!response.success) {
      throw new Error(response.error || 'Error al obtener nóminas activas');
    }

    return response.data;
  },

  /**
   * Obtiene nóminas de un empleado específico
   * @param {number} empleadoId - ID del empleado
   * @param {Object} params - Parámetros de paginación (page, size)
   * @returns {Promise<Object>} Página de nóminas del empleado
   */
  getNominasByEmpleado: async (empleadoId, params = {}) => {
    const { page = 0, size = 10 } = params;

    const response = await apiClient.get(`${NOMINA_BASE_URL}/empleado/${empleadoId}`, {
      params: { page, size }
    });

    if (!response.success) {
      throw new Error(response.error || 'Error al obtener nóminas del empleado');
    }

    return response.data;
  },

  /**
   * Actualiza una nómina existente
   * @param {number} id - ID de la nómina
   * @param {Object} nominaData - Nuevos datos de la nómina
   * @returns {Promise<Object>} Nómina actualizada
   */
  updateNomina: async (id, nominaData) => {
    const response = await apiClient.put(
      `${NOMINA_BASE_URL}/${id}`,
      JSON.stringify(nominaData),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar nómina');
    }

    return response.data;
  },

  /**
   * Desactiva una nómina (soft delete)
   * @param {number} id - ID de la nómina
   * @returns {Promise<void>}
   */
  deactivateNomina: async (id) => {
    const response = await apiClient.patch(`${NOMINA_BASE_URL}/${id}/desactivar`);

    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar nómina');
    }

    return response.data;
  },

  /**
   * Elimina permanentemente una nómina
   * @param {number} id - ID de la nómina
   * @returns {Promise<void>}
   */
  deleteNomina: async (id) => {
    const response = await apiClient.delete(`${NOMINA_BASE_URL}/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar nómina');
    }

    return response.data;
  }
};

export default nominaApiService;
