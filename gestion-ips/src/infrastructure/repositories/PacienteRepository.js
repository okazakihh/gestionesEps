/**
 * Repositorio para Pacientes
 * Infrastructure Layer - Repositories
 */
export class PacienteRepository {
  constructor(pacienteApiService) {
    this.pacienteApiService = pacienteApiService;
  }

  /**
   * Obtiene todos los pacientes con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Respuesta paginada
   */
  async getPacientes(params = {}) {
    try {
      return await this.pacienteApiService.getPacientes(params);
    } catch (error) {
      console.error('Error en PacienteRepository.getPacientes:', error);
      throw new Error('Error al obtener pacientes');
    }
  }

  /**
   * Obtiene un paciente por ID
   * @param {number} id - ID del paciente
   * @returns {Promise<Object>} Paciente encontrado
   */
  async getPacienteById(id) {
    try {
      return await this.pacienteApiService.getPacienteById(id);
    } catch (error) {
      console.error(`Error en PacienteRepository.getPacienteById(${id}):`, error);
      throw new Error(`Paciente con ID ${id} no encontrado`);
    }
  }

  /**
   * Crea un nuevo paciente
   * @param {Object} pacienteData - Datos del paciente
   * @returns {Promise<Object>} Paciente creado
   */
  async createPaciente(pacienteData) {
    try {
      return await this.pacienteApiService.createPaciente(pacienteData);
    } catch (error) {
      console.error('Error en PacienteRepository.createPaciente:', error);
      throw new Error('Error al crear paciente');
    }
  }

  /**
   * Actualiza un paciente existente
   * @param {number} id - ID del paciente
   * @param {Object} pacienteData - Datos actualizados
   * @returns {Promise<Object>} Paciente actualizado
   */
  async updatePaciente(id, pacienteData) {
    try {
      return await this.pacienteApiService.updatePaciente(id, pacienteData);
    } catch (error) {
      console.error(`Error en PacienteRepository.updatePaciente(${id}):`, error);
      throw new Error('Error al actualizar paciente');
    }
  }

  /**
   * Elimina un paciente
   * @param {number} id - ID del paciente
   * @returns {Promise<void>}
   */
  async deletePaciente(id) {
    try {
      await this.pacienteApiService.deletePaciente(id);
    } catch (error) {
      console.error(`Error en PacienteRepository.deletePaciente(${id}):`, error);
      throw new Error('Error al eliminar paciente');
    }
  }

  /**
   * Busca pacientes por número de documento
   * @param {string} numeroDocumento - Número de documento
   * @returns {Promise<Array>} Lista de pacientes encontrados
   */
  async searchByDocumento(numeroDocumento) {
    try {
      return await this.pacienteApiService.searchByDocumento(numeroDocumento);
    } catch (error) {
      console.error(`Error en PacienteRepository.searchByDocumento(${numeroDocumento}):`, error);
      throw new Error('Error al buscar pacientes por documento');
    }
  }
}