/**
 * Repositorio para Empleados
 * Infrastructure Layer - Repositories
 */
export class EmpleadoRepository {
  constructor(empleadosApiService) {
    this.empleadosApiService = empleadosApiService;
  }

  /**
   * Obtiene todos los empleados con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Respuesta paginada
   */
  async getEmpleados(params = {}) {
    try {
      return await this.empleadosApiService.getEmpleados(params);
    } catch (error) {
      console.error('Error en EmpleadoRepository.getEmpleados:', error);
      throw new Error('Error al obtener empleados');
    }
  }

  /**
   * Obtiene un empleado por ID
   * @param {number} id - ID del empleado
   * @returns {Promise<Object>} Empleado encontrado
   */
  async getEmpleadoById(id) {
    try {
      // Nota: Puede que necesites implementar este método en empleadosApiService
      // Por ahora, buscar en la lista completa
      const empleados = await this.getEmpleados({ size: 1000 });

      if (!empleados || !empleados.content) {
        throw new Error(`Empleado con ID ${id} no encontrado`);
      }

      const empleado = empleados.content.find(emp => emp.id === id);
      if (!empleado) {
        throw new Error(`Empleado con ID ${id} no encontrado`);
      }

      return empleado;
    } catch (error) {
      console.error(`Error en EmpleadoRepository.getEmpleadoById(${id}):`, error);
      throw new Error(`Empleado con ID ${id} no encontrado`);
    }
  }

  /**
   * Busca empleados por criterios específicos
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Array>} Empleados encontrados
   */
  async buscarEmpleados(criterios = {}) {
    try {
      const empleados = await this.getEmpleados({ size: 1000 });

      if (!empleados || !empleados.content) {
        return [];
      }

      return empleados.content.filter(empleado => {
        const datosCompletos = this._parseDatosJson(empleado.jsonData);

        // Filtro por número de documento
        if (criterios.numeroDocumento &&
            datosCompletos.numeroDocumento !== criterios.numeroDocumento) {
          return false;
        }

        // Filtro por especialidad
        if (criterios.especialidad) {
          if (datosCompletos.jsonData) {
            const datosInternos = this._parseDatosJson(datosCompletos.jsonData);
            const especialidad = datosInternos.informacionLaboral?.especialidad;
            if (!especialidad || !especialidad.toLowerCase().includes(criterios.especialidad.toLowerCase())) {
              return false;
            }
          } else {
            return false;
          }
        }

        // Filtro por nombre
        if (criterios.nombre) {
          if (datosCompletos.jsonData) {
            const datosInternos = this._parseDatosJson(datosCompletos.jsonData);
            const infoPersonal = datosInternos.informacionPersonal || {};
            const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''}`.trim();
            if (!nombreCompleto.toLowerCase().includes(criterios.nombre.toLowerCase())) {
              return false;
            }
          } else {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error en EmpleadoRepository.buscarEmpleados:', error);
      throw new Error('Error al buscar empleados');
    }
  }

  /**
   * Obtiene médicos (empleados con especialidad médica)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Array>} Lista de médicos
   */
  async getMedicos(params = {}) {
    try {
      const empleados = await this.getEmpleados({ size: 1000, ...params });

      if (!empleados || !empleados.content) {
        return [];
      }

      // Filtrar empleados que son médicos (tienen especialidad)
      return empleados.content.filter(empleado => {
        try {
          const datosCompletos = this._parseDatosJson(empleado.jsonData);

          if (datosCompletos.jsonData) {
            const datosInternos = this._parseDatosJson(datosCompletos.jsonData);
            const especialidad = datosInternos.informacionLaboral?.especialidad;
            return especialidad && especialidad.trim() !== '';
          }

          return false;
        } catch (error) {
          console.warn(`Error procesando empleado ${empleado.id}:`, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error en EmpleadoRepository.getMedicos:', error);
      throw new Error('Error al obtener médicos');
    }
  }

  /**
   * Obtiene información de un médico por nombre o documento
   * @param {string} identificador - Nombre o documento del médico
   * @returns {Promise<Object>} Información del médico
   */
  async getMedicoInfo(identificador) {
    try {
      const medicos = await this.getMedicos();

      for (const medico of medicos) {
        try {
          const datosCompletos = this._parseDatosJson(medico.jsonData);

          if (datosCompletos.jsonData) {
            const datosInternos = this._parseDatosJson(datosCompletos.jsonData);
            const infoPersonal = datosInternos.informacionPersonal || {};
            const infoLaboral = datosInternos.informacionLaboral || {};

            const nombreBase = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''}`.trim();
            const especialidad = infoLaboral.especialidad;
            const nombreCompleto = especialidad ? `${nombreBase} - ${especialidad}` : nombreBase;

            // Verificar si coincide con el identificador
            if (nombreCompleto === identificador ||
                nombreBase === identificador ||
                datosCompletos.numeroDocumento === identificador) {
              return {
                nombre: nombreCompleto,
                documento: datosCompletos.numeroDocumento || 'N/A',
                especialidad: especialidad || 'N/A',
                nombreBase: nombreBase
              };
            }
          }
        } catch (error) {
          console.warn(`Error procesando médico ${medico.id}:`, error);
        }
      }

      return {
        nombre: identificador,
        documento: 'N/A',
        especialidad: 'N/A',
        nombreBase: identificador
      };
    } catch (error) {
      console.error(`Error en EmpleadoRepository.getMedicoInfo(${identificador}):`, error);
      return {
        nombre: identificador,
        documento: 'N/A',
        especialidad: 'N/A',
        nombreBase: identificador
      };
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
      console.warn('Error parseando datos JSON de empleado:', error);
      return {};
    }
  }
}