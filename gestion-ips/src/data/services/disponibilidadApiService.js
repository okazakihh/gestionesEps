import apiClient from '../api/apiClient.js';

const API_URL = '/api/disponibilidad-medico';

export const disponibilidadApiService = {
  /**
   * Crea un nuevo registro de disponibilidad para un médico.
   * @param {object} disponibilidadData - Datos de la disponibilidad.
   * @returns {Promise<object>}
   */
  createDisponibilidad: (disponibilidadData) => {
    return apiClient.post(API_URL, disponibilidadData);
  },

  /**
   * Obtiene las disponibilidades en un rango de fechas.
   * @param {string} fechaInicio - Fecha de inicio en formato YYYY-MM-DD.
   * @param {string} fechaFin - Fecha de fin en formato YYYY-MM-DD.
   * @returns {Promise<Array>}
   */
  getDisponibilidadPorRango: (fechaInicio, fechaFin) => {
    return apiClient.get(API_URL, {
      params: { fechaInicio, fechaFin }
    });
  },

  /**
   * Elimina un registro de disponibilidad por su ID.
   * @param {number} id - ID de la disponibilidad.
   * @returns {Promise<void>}
   */
  deleteDisponibilidad: (id) => {
    return apiClient.delete(`${API_URL}/${id}`);
  },

  /**
   * Obtiene las disponibilidades de un médico para una fecha específica.
   * @param {number} doctorId - ID del doctor.
   * @param {string} fecha - Fecha en formato YYYY-MM-DD.
   * @returns {Promise<Array>}
   */
  getDisponibilidadPorDoctor: (doctorId, fecha) => {
    return apiClient.get(`${API_URL}/doctor/${doctorId}/fecha/${fecha}`);
  },

  /**
   * Obtiene todas las disponibilidades para una fecha específica.
   * @returns {Promise<Array>}
   */
  getAllDisponibilidades: () => {
    // Llama al endpoint raíz para obtener todos los registros
    return apiClient.get(API_URL);
  }
};
