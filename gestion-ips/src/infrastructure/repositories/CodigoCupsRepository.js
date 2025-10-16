/**
 * Repositorio para Códigos CUPS
 * Infrastructure Layer - Repositories
 */
export class CodigoCupsRepository {
  constructor(codigosCupsApiService) {
    this.codigosCupsApiService = codigosCupsApiService;
  }

  /**
   * Obtiene todos los códigos CUPS con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Respuesta paginada
   */
  async getCodigosCups(params = {}) {
    try {
      return await this.codigosCupsApiService.getCodigosCups(params);
    } catch (error) {
      console.error('Error en CodigoCupsRepository.getCodigosCups:', error);
      throw new Error('Error al obtener códigos CUPS');
    }
  }

  /**
   * Obtiene un código CUPS por ID
   * @param {number} id - ID del código CUPS
   * @returns {Promise<Object>} Código CUPS encontrado
   */
  async getCodigoCupsById(id) {
    try {
      return await this.codigosCupsApiService.getCodigoCupsById(id);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.getCodigoCupsById(${id}):`, error);
      throw new Error(`Código CUPS con ID ${id} no encontrado`);
    }
  }

  /**
   * Obtiene un código CUPS por código
   * @param {string} codigoCup - Código CUPS
   * @returns {Promise<Object>} Código CUPS encontrado
   */
  async getCodigoCupsByCodigo(codigoCup) {
    try {
      return await this.codigosCupsApiService.getCodigoCupsByCodigo(codigoCup);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.getCodigoCupsByCodigo(${codigoCup}):`, error);
      throw new Error(`Código CUPS ${codigoCup} no encontrado`);
    }
  }

  /**
   * Crea un nuevo código CUPS
   * @param {Object} codigoCupsData - Datos del código CUPS
   * @returns {Promise<Object>} Código CUPS creado
   */
  async createCodigoCups(codigoCupsData) {
    try {
      return await this.codigosCupsApiService.createCodigoCups(codigoCupsData);
    } catch (error) {
      console.error('Error en CodigoCupsRepository.createCodigoCups:', error);
      throw new Error('Error al crear código CUPS');
    }
  }

  /**
   * Actualiza un código CUPS existente
   * @param {number} id - ID del código CUPS
   * @param {Object} codigoCupsData - Datos actualizados
   * @returns {Promise<Object>} Código CUPS actualizado
   */
  async updateCodigoCups(id, codigoCupsData) {
    try {
      return await this.codigosCupsApiService.updateCodigoCups(id, codigoCupsData);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.updateCodigoCups(${id}):`, error);
      throw new Error('Error al actualizar código CUPS');
    }
  }

  /**
   * Elimina un código CUPS
   * @param {number} id - ID del código CUPS
   * @returns {Promise<void>}
   */
  async deleteCodigoCups(id) {
    try {
      await this.codigosCupsApiService.deleteCodigoCups(id);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.deleteCodigoCups(${id}):`, error);
      throw new Error('Error al eliminar código CUPS');
    }
  }

  /**
   * Busca códigos CUPS por nombre
   * @param {string} nombre - Nombre a buscar
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchByNombre(nombre, params = {}) {
    try {
      return await this.codigosCupsApiService.searchByNombre(nombre, params);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.searchByNombre(${nombre}):`, error);
      throw new Error('Error al buscar códigos CUPS por nombre');
    }
  }

  /**
   * Busca códigos CUPS por código
   * @param {string} codigo - Código a buscar
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchByCodigo(codigo, params = {}) {
    try {
      return await this.codigosCupsApiService.searchByCodigo(codigo, params);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.searchByCodigo(${codigo}):`, error);
      throw new Error('Error al buscar códigos CUPS por código');
    }
  }

  /**
   * Búsqueda general de códigos CUPS
   * @param {string} termino - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchGeneral(termino, params = {}) {
    try {
      return await this.codigosCupsApiService.searchGeneral(termino, params);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.searchGeneral(${termino}):`, error);
      throw new Error('Error en búsqueda general de códigos CUPS');
    }
  }

  /**
   * Verifica si existe un código CUPS
   * @param {string} codigoCup - Código CUPS a verificar
   * @returns {Promise<boolean>} True si existe
   */
  async existeCodigoCups(codigoCup) {
    try {
      const result = await this.codigosCupsApiService.existeCodigoCups(codigoCup);
      return result || false;
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.existeCodigoCups(${codigoCup}):`, error);
      return false;
    }
  }

  /**
   * Actualiza el valor de un código CUPS
   * @param {number} id - ID del código CUPS
   * @param {number} nuevoValor - Nuevo valor
   * @param {string} motivo - Motivo del cambio
   * @param {string} usuario - Usuario que realiza el cambio
   * @returns {Promise<Object>} Código CUPS actualizado
   */
  async actualizarValor(id, nuevoValor, motivo, usuario) {
    try {
      // Obtener el código CUPS actual
      const codigoCups = await this.getCodigoCupsById(id);

      // Parsear datos JSON actuales
      const datosJson = this._parseDatosJson(codigoCups.datosJson);

      // Actualizar valor
      datosJson.valor = nuevoValor;

      // Preparar datos para actualización
      const updateData = {
        codigoCup: codigoCups.codigoCup,
        nombreCup: codigoCups.nombreCup,
        datosJson: JSON.stringify(datosJson)
      };

      return await this.updateCodigoCups(id, updateData);
    } catch (error) {
      console.error(`Error en CodigoCupsRepository.actualizarValor(${id}):`, error);
      throw new Error('Error al actualizar valor del código CUPS');
    }
  }

  /**
   * Parsear datos JSON de manera segura
   * @private
   */
  _parseDatosJson(datosJson) {
    if (!datosJson) return {};

    try {
      return typeof datosJson === 'string'
        ? JSON.parse(datosJson)
        : datosJson;
    } catch (error) {
      console.warn('Error parseando datos JSON de código CUPS:', error);
      return {};
    }
  }
}