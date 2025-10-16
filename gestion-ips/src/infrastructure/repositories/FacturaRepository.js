/**
 * Repositorio para Facturas
 * Infrastructure Layer - Repositories
 */
export class FacturaRepository {
  constructor(facturacionApiService) {
    this.facturacionApiService = facturacionApiService;
  }

  /**
   * Obtiene todas las facturas con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Respuesta paginada
   */
  async getFacturas(params = {}) {
    try {
      return await this.facturacionApiService.getFacturaciones(params);
    } catch (error) {
      console.error('Error en FacturaRepository.getFacturas:', error);
      throw new Error('Error al obtener facturas');
    }
  }

  /**
   * Obtiene una factura por ID
   * @param {number} id - ID de la factura
   * @returns {Promise<Object>} Factura encontrada
   */
  async getFacturaById(id) {
    try {
      return await this.facturacionApiService.getFacturacionById(id);
    } catch (error) {
      console.error(`Error en FacturaRepository.getFacturaById(${id}):`, error);
      throw new Error(`Factura con ID ${id} no encontrada`);
    }
  }

  /**
   * Crea una nueva factura
   * @param {Object} facturaData - Datos de la factura
   * @returns {Promise<Object>} Factura creada
   */
  async createFactura(facturaData) {
    try {
      return await this.facturacionApiService.createFacturacion(facturaData);
    } catch (error) {
      console.error('Error en FacturaRepository.createFactura:', error);
      throw new Error('Error al crear factura');
    }
  }

  /**
   * Actualiza una factura existente
   * @param {number} id - ID de la factura
   * @param {Object} facturaData - Datos actualizados
   * @returns {Promise<Object>} Factura actualizada
   */
  async updateFactura(id, facturaData) {
    try {
      return await this.facturacionApiService.updateFacturacion(id, facturaData);
    } catch (error) {
      console.error(`Error en FacturaRepository.updateFactura(${id}):`, error);
      throw new Error('Error al actualizar factura');
    }
  }

  /**
   * Desactiva una factura
   * @param {number} id - ID de la factura
   * @returns {Promise<Object>} Factura desactivada
   */
  async deactivateFactura(id) {
    try {
      return await this.facturacionApiService.deactivateFacturacion(id);
    } catch (error) {
      console.error(`Error en FacturaRepository.deactivateFactura(${id}):`, error);
      throw new Error('Error al desactivar factura');
    }
  }

  /**
   * Elimina una factura
   * @param {number} id - ID de la factura
   * @returns {Promise<void>}
   */
  async deleteFactura(id) {
    try {
      await this.facturacionApiService.deleteFacturacion(id);
    } catch (error) {
      console.error(`Error en FacturaRepository.deleteFactura(${id}):`, error);
      throw new Error('Error al eliminar factura');
    }
  }

  /**
   * Actualiza el estado de una factura (ej: marcar como pagada)
   * @param {number} id - ID de la factura
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Factura actualizada
   */
  async actualizarEstadoFactura(id, estado) {
    try {
      // Crear objeto con el nuevo estado
      const updateData = {
        estado: estado,
        fechaActualizacion: new Date().toISOString()
      };

      return await this.updateFactura(id, updateData);
    } catch (error) {
      console.error(`Error en FacturaRepository.actualizarEstadoFactura(${id}, ${estado}):`, error);
      throw new Error('Error al actualizar estado de factura');
    }
  }

  /**
   * Busca facturas por criterios específicos
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Array>} Facturas encontradas
   */
  async buscarFacturas(criterios = {}) {
    try {
      // Implementar búsqueda específica según criterios
      // Por ahora, obtener todas y filtrar localmente
      const facturas = await this.getFacturas({ size: 1000 });

      if (!facturas || !facturas.content) {
        return [];
      }

      return facturas.content.filter(factura => {
        const facturaData = this._parseDatosJson(factura.jsonData);

        // Filtro por número de factura
        if (criterios.numeroFactura &&
            !facturaData.numeroFactura?.toLowerCase().includes(criterios.numeroFactura.toLowerCase())) {
          return false;
        }

        // Filtro por estado
        if (criterios.estado && facturaData.estado !== criterios.estado) {
          return false;
        }

        // Filtro por paciente
        if (criterios.pacienteId && factura.pacienteId !== criterios.pacienteId) {
          return false;
        }

        return true;
      });
    } catch (error) {
      console.error('Error en FacturaRepository.buscarFacturas:', error);
      throw new Error('Error al buscar facturas');
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
      console.warn('Error parseando datos JSON de factura:', error);
      return {};
    }
  }
}