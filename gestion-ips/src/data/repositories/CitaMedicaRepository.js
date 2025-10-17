/**
 * Repositorio para Citas Médicas
 * Infrastructure Layer - Repositories
 */
export class CitaMedicaRepository {
  constructor(citaMedicaApiService) {
    this.citaMedicaApiService = citaMedicaApiService;
  }

  /**
   * Obtiene todas las citas médicas con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Respuesta paginada
   */
  async getCitas(params = {}) {
    try {
      return await this.citaMedicaApiService.getCitas(params);
    } catch (error) {
      console.error('Error en CitaMedicaRepository.getCitas:', error);
      throw new Error('Error al obtener citas médicas');
    }
  }

  /**
   * Obtiene una cita médica por ID
   * @param {number} id - ID de la cita
   * @returns {Promise<Object>} Cita encontrada
   */
  async getCitaById(id) {
    try {
      return await this.citaMedicaApiService.getCitaById(id);
    } catch (error) {
      console.error(`Error en CitaMedicaRepository.getCitaById(${id}):`, error);
      throw new Error(`Cita médica con ID ${id} no encontrada`);
    }
  }

  /**
   * Obtiene citas pendientes
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Citas pendientes
   */
  async getCitasPendientes(params = {}) {
    try {
      return await this.citaMedicaApiService.getCitasPendientes(params);
    } catch (error) {
      console.error('Error en CitaMedicaRepository.getCitasPendientes:', error);
      throw new Error('Error al obtener citas pendientes');
    }
  }

  /**
   * Obtiene citas por paciente
   * @param {number} pacienteId - ID del paciente
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Citas del paciente
   */
  async getCitasByPaciente(pacienteId, params = {}) {
    try {
      return await this.citaMedicaApiService.getCitasByPaciente(pacienteId, params);
    } catch (error) {
      console.error(`Error en CitaMedicaRepository.getCitasByPaciente(${pacienteId}):`, error);
      throw new Error('Error al obtener citas del paciente');
    }
  }

  /**
   * Crea una nueva cita médica
   * @param {number} pacienteId - ID del paciente
   * @param {Object} citaData - Datos de la cita
   * @returns {Promise<Object>} Cita creada
   */
  async createCita(pacienteId, citaData) {
    try {
      return await this.citaMedicaApiService.createAppointment(pacienteId, citaData);
    } catch (error) {
      console.error('Error en CitaMedicaRepository.createCita:', error);
      throw new Error('Error al crear cita médica');
    }
  }

  /**
   * Actualiza una cita médica
   * @param {number} id - ID de la cita
   * @param {Object} citaData - Datos actualizados
   * @returns {Promise<Object>} Cita actualizada
   */
  async updateCita(id, citaData) {
    try {
      return await this.citaMedicaApiService.updateCita(id, citaData);
    } catch (error) {
      console.error(`Error en CitaMedicaRepository.updateCita(${id}):`, error);
      throw new Error('Error al actualizar cita médica');
    }
  }

  /**
   * Cancela una cita médica
   * @param {number} id - ID de la cita
   * @returns {Promise<Object>} Cita cancelada
   */
  async cancelCita(id) {
    try {
      return await this.citaMedicaApiService.cancelCita(id);
    } catch (error) {
      console.error(`Error en CitaMedicaRepository.cancelCita(${id}):`, error);
      throw new Error('Error al cancelar cita médica');
    }
  }

  /**
   * Actualiza el estado de una cita médica
   * @param {number} id - ID de la cita
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Cita actualizada
   */
  async actualizarEstadoCita(id, estado) {
    try {
      return await this.citaMedicaApiService.actualizarEstadoCita(id, estado);
    } catch (error) {
      console.error(`Error en CitaMedicaRepository.actualizarEstadoCita(${id}, ${estado}):`, error);
      throw new Error('Error al actualizar estado de cita médica');
    }
  }
}