/**
 * Servicio de API para gestión de Configuración del Sistema IPS
 * Capa de Datos - Servicios
 * 
 * Este servicio maneja todas las operaciones CRUD relacionadas con
 * la configuración del sistema a través del Gateway.
 */

import { apiClient } from '../api/apiClient.js';

// Base URL for configuracion service - using Gateway (apiClient handles the base URL)
const CONFIGURACION_BASE_URL = '/api/configuracion';

/**
 * Configuración API Service
 * Proporciona métodos para interactuar con el backend de configuración
 */
export const configuracionApiService = {
  /**
   * Obtener todas las configuraciones activas con paginación
   * @param {Object} params - Parámetros de paginación (page, size)
   * @returns {Promise<Object>} Página de configuraciones con jsonData parseado
   */
  getConfiguraciones: async (params = { page: 0, size: 10 }) => {
    const response = await apiClient.get(CONFIGURACION_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener configuraciones');
    }
    
    // Parsear jsonData de cada configuración si viene como string
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map(config => {
        if (config && typeof config.jsonData === 'string') {
          try {
            config.jsonData = JSON.parse(config.jsonData);
          } catch (error) {
            console.error('Error al parsear jsonData de configuración:', error);
          }
        }
        return config;
      });
    }
    
    return response.data;
  },

  /**
   * Obtener configuración por ID
   * @param {number} id - ID de la configuración
   * @returns {Promise<Object>} Datos de la configuración con jsonData parseado
   */
  getConfiguracionById: async (id) => {
    const response = await apiClient.get(`${CONFIGURACION_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener configuración');
    }
    
    // Parsear jsonData si viene como string
    if (response.data && typeof response.data.jsonData === 'string') {
      try {
        response.data.jsonData = JSON.parse(response.data.jsonData);
      } catch (error) {
        console.error('Error al parsear jsonData:', error);
      }
    }
    
    return response.data;
  },

  /**
   * Obtener configuración por clave única
   * @param {string} clave - Clave única de la configuración
   * @returns {Promise<Object>} Datos de la configuración con jsonData parseado
   */
  getConfiguracionByClave: async (clave) => {
    const response = await apiClient.get(`${CONFIGURACION_BASE_URL}/clave/${clave}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener configuración por clave');
    }
    
    // Parsear jsonData si viene como string
    if (response.data && typeof response.data.jsonData === 'string') {
      try {
        response.data.jsonData = JSON.parse(response.data.jsonData);
      } catch (error) {
        console.error('Error al parsear jsonData:', error);
        // Si falla el parsing, dejar como string
      }
    }
    
    return response.data;
  },

  /**
   * Obtener configuraciones por tipo
   * @param {string} tipo - Tipo de configuración (IPS, SISTEMA, NOTIFICACIONES, etc.)
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Página de configuraciones filtradas por tipo con jsonData parseado
   */
  getConfiguracionesByTipo: async (tipo, params = { page: 0, size: 10 }) => {
    const response = await apiClient.get(`${CONFIGURACION_BASE_URL}/tipo/${tipo}`, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener configuraciones por tipo');
    }
    
    // Parsear jsonData de cada configuración si viene como string
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map(config => {
        if (config && typeof config.jsonData === 'string') {
          try {
            config.jsonData = JSON.parse(config.jsonData);
          } catch (error) {
            console.error('Error al parsear jsonData de configuración:', error);
          }
        }
        return config;
      });
    }
    
    return response.data;
  },

  /**
   * Crear nueva configuración
   * @param {Object} configuracionData - Objeto con jsonData, clave y tipoConfiguracion
   * @returns {Promise<Object>} Configuración creada
   */
  createConfiguracion: async (configuracionData) => {
    const response = await apiClient.post(CONFIGURACION_BASE_URL, configuracionData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear configuración');
    }
    return response.data;
  },

  /**
   * Actualizar configuración por ID
   * @param {number} id - ID de la configuración
   * @param {string} jsonData - Datos JSON actualizados
   * @returns {Promise<Object>} Configuración actualizada
   */
  updateConfiguracion: async (id, jsonData) => {
    const response = await apiClient.put(`${CONFIGURACION_BASE_URL}/${id}`, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar configuración');
    }
    return response.data;
  },

  /**
   * Actualizar configuración por clave
   * @param {string} clave - Clave única de la configuración
   * @param {Object} jsonData - Objeto de datos de configuración (se convierte automáticamente a JSON string)
   * @returns {Promise<Object>} Configuración actualizada
   */
  updateConfiguracionByClave: async (clave, jsonData) => {
    // El backend espera un JSON string directo en el body
    // Convertimos el objeto a string JSON
    const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
    
    const response = await apiClient.put(`${CONFIGURACION_BASE_URL}/clave/${clave}`, jsonString, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar configuración por clave');
    }
    return response.data;
  },

  /**
   * Desactivar configuración (soft delete)
   * @param {number} id - ID de la configuración
   * @returns {Promise<void>}
   */
  deactivateConfiguracion: async (id) => {
    const response = await apiClient.patch(`${CONFIGURACION_BASE_URL}/${id}/desactivar`);
    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar configuración');
    }
  },

  /**
   * Eliminar configuración permanentemente
   * @param {number} id - ID de la configuración
   * @returns {Promise<void>}
   */
  deleteConfiguracion: async (id) => {
    const response = await apiClient.delete(`${CONFIGURACION_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar configuración');
    }
  }
};

export default configuracionApiService;
