/**
 * Caso de uso para obtener facturas con filtros
 * Application Layer - Use Cases
 */
export class ObtenerFacturasUseCase {
  constructor(facturaRepository) {
    this.facturaRepository = facturaRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener facturas
   * @param {Object} filtros - Filtros opcionales para las facturas
   * @returns {Promise<Array>} Lista de facturas filtradas
   */
  async execute(filtros = {}) {
    try {
      // 1. Obtener todas las facturas
      const facturasResponse = await this.facturaRepository.getFacturas({
        size: 1000,
        ...filtros
      });

      if (!facturasResponse || !facturasResponse.content) {
        return [];
      }

      // 2. Aplicar filtros adicionales
      let facturasFiltradas = facturasResponse.content;

      // Filtro por número de factura
      if (filtros.numeroFactura && filtros.numeroFactura.trim()) {
        facturasFiltradas = facturasFiltradas.filter(factura => {
          const facturaData = this._parseDatosJson(factura.jsonData);
          const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
          return numeroFactura.toLowerCase().includes(filtros.numeroFactura.toLowerCase());
        });
      }

      // Filtro por fecha inicio
      if (filtros.fechaInicio) {
        const fechaInicioDate = new Date(filtros.fechaInicio + 'T00:00:00');
        facturasFiltradas = facturasFiltradas.filter(factura => {
          try {
            const facturaData = this._parseDatosJson(factura.jsonData);
            const fechaFactura = new Date(facturaData.fechaEmision || factura.fechaCreacion);
            return fechaFactura >= fechaInicioDate;
          } catch (error) {
            console.warn(`Error filtrando factura por fecha inicio ${factura.id}:`, error);
            return false;
          }
        });
      }

      // Filtro por fecha fin
      if (filtros.fechaFin) {
        const fechaFinDate = new Date(filtros.fechaFin + 'T23:59:59');
        facturasFiltradas = facturasFiltradas.filter(factura => {
          try {
            const facturaData = this._parseDatosJson(factura.jsonData);
            const fechaFactura = new Date(facturaData.fechaEmision || factura.fechaCreacion);
            return fechaFactura <= fechaFinDate;
          } catch (error) {
            console.warn(`Error filtrando factura por fecha fin ${factura.id}:`, error);
            return false;
          }
        });
      }

      // 3. Ordenar por fecha descendente
      facturasFiltradas.sort((a, b) => {
        try {
          const fechaA = new Date(this._obtenerFechaFactura(a));
          const fechaB = new Date(this._obtenerFechaFactura(b));
          return fechaB - fechaA;
        } catch (error) {
          return 0;
        }
      });

      // 4. Limitar resultados (por defecto mostrar últimas 10)
      const limite = filtros.limite || 10;
      return facturasFiltradas.slice(0, limite);

    } catch (error) {
      console.error('Error en ObtenerFacturasUseCase:', error);
      throw new Error('No se pudieron obtener las facturas');
    }
  }

  /**
   * Obtiene el resumen de facturas para un período
   * @param {Object} filtros - Filtros para el resumen
   * @returns {Promise<Object>} Resumen estadístico
   */
  async obtenerResumen(filtros = {}) {
    try {
      const facturas = await this.execute({ ...filtros, limite: 1000 }); // Obtener todas para resumen

      const resumen = {
        totalFacturas: facturas.length,
        totalFacturado: facturas.reduce((total, factura) => {
          const facturaData = this._parseDatosJson(factura.jsonData);
          return total + (facturaData.total || 0);
        }, 0),
        facturasPendientes: facturas.filter(factura => {
          const facturaData = this._parseDatosJson(factura.jsonData);
          return facturaData.estado === 'PENDIENTE';
        }).length,
        facturasPagadas: facturas.filter(factura => {
          const facturaData = this._parseDatosJson(factura.jsonData);
          return facturaData.estado === 'PAGADA';
        }).length,
        facturasVencidas: facturas.filter(factura => {
          const facturaData = this._parseDatosJson(factura.jsonData);
          return facturaData.estado === 'VENCIDA';
        }).length
      };

      return resumen;

    } catch (error) {
      console.error('Error obteniendo resumen de facturas:', error);
      throw new Error('No se pudo obtener el resumen de facturas');
    }
  }

  /**
   * Obtiene una factura por ID con información completa
   * @param {number} facturaId - ID de la factura
   * @returns {Promise<Object>} Factura con información completa
   */
  async obtenerFacturaPorId(facturaId) {
    try {
      const factura = await this.facturaRepository.getFacturaById(facturaId);

      if (!factura) {
        throw new Error(`Factura con ID ${facturaId} no encontrada`);
      }

      // Enriquecer con datos adicionales si es necesario
      const facturaData = this._parseDatosJson(factura.jsonData);

      return {
        ...factura,
        ...facturaData,
        detallesCompletos: true
      };

    } catch (error) {
      console.error(`Error obteniendo factura ${facturaId}:`, error);
      throw new Error(`No se pudo obtener la factura: ${error.message}`);
    }
  }

  /**
   * Obtiene la fecha de una factura
   * @private
   */
  _obtenerFechaFactura(factura) {
    try {
      const facturaData = this._parseDatosJson(factura.jsonData);
      return facturaData.fechaEmision || factura.fechaCreacion;
    } catch (error) {
      console.warn(`Error obteniendo fecha de factura ${factura.id}:`, error);
      return new Date(0);
    }
  }

  /**
   * Parsear datos JSON de manera segura
   * @private
   */
  _parseDatosJson(datosJson) {
    if (!datosJson) return {};

    try {
      const parsed = typeof datosJson === 'string'
        ? JSON.parse(datosJson)
        : datosJson;

      // Verificar si está doblemente anidado (jsonData dentro de jsonData)
      if (parsed.jsonData) {
        return typeof parsed.jsonData === 'string'
          ? JSON.parse(parsed.jsonData)
          : parsed.jsonData;
      }

      return parsed;
    } catch (error) {
      console.warn('Error parseando datos JSON:', error);
      return {};
    }
  }
}