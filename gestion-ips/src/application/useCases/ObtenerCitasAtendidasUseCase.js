/**
 * Caso de uso para obtener citas médicas atendidas
 * Application Layer - Use Cases
 */
export class ObtenerCitasAtendidasUseCase {
  constructor(citaMedicaRepository, pacienteRepository, codigoCupsRepository, empleadoRepository, facturaRepository) {
    this.citaMedicaRepository = citaMedicaRepository;
    this.pacienteRepository = pacienteRepository;
    this.codigoCupsRepository = codigoCupsRepository;
    this.empleadoRepository = empleadoRepository;
    this.facturaRepository = facturaRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener citas atendidas con información completa
   * @param {Object} filtros - Filtros opcionales para las citas
   * @returns {Promise<Array>} Lista de citas atendidas con información enriquecida
   */
  async execute(filtros = {}) {
    try {
      // 1. Obtener todas las citas médicas
      const citasResponse = await this.citaMedicaRepository.getCitas({
        size: 1000,
        ...filtros
      });

      if (!citasResponse || !citasResponse.content) {
        return [];
      }

      // 2. Filtrar solo citas atendidas
      const citasAtendidas = citasResponse.content.filter(cita => {
        try {
          const datosJson = typeof cita.datosJson === 'string'
            ? JSON.parse(cita.datosJson)
            : cita.datosJson;
          return datosJson.estado === 'ATENDIDO';
        } catch (error) {
          console.warn(`Error procesando cita ${cita.id}:`, error);
          return false;
        }
      });

      // 3. Ordenar por fecha descendente
      citasAtendidas.sort((a, b) => {
        try {
          const fechaA = new Date(this._parseFechaCita(a));
          const fechaB = new Date(this._parseFechaCita(b));
          return fechaB - fechaA;
        } catch (error) {
          return 0;
        }
      });

      // 4. Filtrar citas que no han sido facturadas
      const citasNoFacturadas = await this._filtrarCitasNoFacturadas(citasAtendidas);

      // 5. Enriquecer citas con información adicional
      const citasEnriquecidas = await Promise.all(
        citasNoFacturadas.map(async (cita) => {
          try {
            return await this._enriquecerCita(cita);
          } catch (error) {
            console.error(`Error enriqueciendo cita ${cita.id}:`, error);
            return null;
          }
        })
      );

      // 6. Filtrar citas válidas y aplicar filtros adicionales
      return citasEnriquecidas
        .filter(cita => cita !== null)
        .filter(cita => this._aplicarFiltrosAdicionales(cita, filtros));

    } catch (error) {
      console.error('Error en ObtenerCitasAtendidasUseCase:', error);
      throw new Error('No se pudieron obtener las citas atendidas');
    }
  }

  /**
   * Enriquecer una cita con información de paciente, médico y CUPS
   * @private
   */
  async _enriquecerCita(cita) {
    const datosJson = this._parseDatosJson(cita.datosJson);
    const codigoCups = datosJson.codigoCups;

    // Información del paciente
    const pacienteInfo = await this._obtenerInformacionPaciente(cita.pacienteId);

    // Información del CUPS y valor
    const { valorCita, nombreProcedimiento } = await this._obtenerInformacionCups(codigoCups);

    // Información del médico
    const medicoInfo = await this._obtenerInformacionMedico(datosJson.medicoAsignado);

    return {
      ...cita,
      nombrePaciente: pacienteInfo.nombre,
      documentoPaciente: pacienteInfo.documento,
      nombreMedico: medicoInfo.nombre,
      documentoMedico: medicoInfo.documento,
      nombreProcedimiento: nombreProcedimiento || datosJson.motivo || 'Procedimiento médico',
      valorCita,
      codigoCups: codigoCups || 'N/A',
      fechaAtencion: datosJson.fechaHoraCita
    };
  }

  /**
   * Obtener información del paciente
   * @private
   */
  async _obtenerInformacionPaciente(pacienteId) {
    if (!pacienteId) {
      return { nombre: 'Paciente no identificado', documento: 'N/A' };
    }

    try {
      const paciente = await this.pacienteRepository.getPacienteById(pacienteId);

      if (paciente && paciente.datosJson) {
        const datosPaciente = this._parseDatosJson(paciente.datosJson);
        const documentoPaciente = paciente.numeroDocumento || paciente.documento || 'N/A';

        let nombrePaciente = 'Paciente';
        if (datosPaciente.informacionPersonalJson) {
          const infoPersonal = this._parseDatosJson(datosPaciente.informacionPersonalJson);
          nombrePaciente = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || `Paciente ${pacienteId}`;
        }

        return {
          nombre: nombrePaciente,
          documento: documentoPaciente
        };
      }
    } catch (error) {
      console.warn(`Error obteniendo información del paciente ${pacienteId}:`, error);
    }

    return { nombre: `Paciente ${pacienteId}`, documento: 'N/A' };
  }

  /**
   * Obtener información del código CUPS
   * @private
   */
  async _obtenerInformacionCups(codigoCups) {
    if (!codigoCups) {
      return { valorCita: 0, nombreProcedimiento: 'Procedimiento médico' };
    }

    try {
      const cupsInfo = await this.codigoCupsRepository.getCodigoCupsByCodigo(codigoCups);

      if (cupsInfo && cupsInfo.datosJson) {
        const cupsDatos = this._parseDatosJson(cupsInfo.datosJson);
        return {
          valorCita: cupsDatos.valor || 0,
          nombreProcedimiento: cupsInfo.nombreCup || 'Procedimiento médico'
        };
      }
    } catch (error) {
      console.warn(`Error obteniendo información del CUPS ${codigoCups}:`, error);
    }

    return { valorCita: 0, nombreProcedimiento: 'Procedimiento médico' };
  }

  /**
   * Obtener información del médico
   * @private
   */
  async _obtenerInformacionMedico(medicoAsignado) {
    if (!medicoAsignado) {
      return { nombre: 'Médico no asignado', documento: 'N/A' };
    }

    try {
      // Obtener lista de empleados para encontrar el médico
      const empleadosResponse = await this.empleadoRepository.getEmpleados({ size: 1000 });
      const empleados = empleadosResponse.content || [];

      for (const empleado of empleados) {
        try {
          const datosCompletos = this._parseDatosJson(empleado.jsonData || '{}');

          if (datosCompletos.jsonData) {
            const datosInternos = this._parseDatosJson(datosCompletos.jsonData);
            const informacionPersonal = datosInternos.informacionPersonal || {};
            const informacionLaboral = datosInternos.informacionLaboral || {};

            const nombreBase = `${informacionPersonal.primerNombre || ''} ${informacionPersonal.segundoNombre || ''} ${informacionPersonal.primerApellido || ''}`.trim();
            const especialidad = informacionLaboral.especialidad;
            const nombreCompleto = especialidad ? `${nombreBase} - ${especialidad}` : nombreBase;

            // Verificar si coincide con el médico asignado
            if (nombreCompleto === medicoAsignado ||
                nombreBase === medicoAsignado ||
                datosCompletos.numeroDocumento === medicoAsignado) {
              return {
                nombre: nombreCompleto,
                documento: datosCompletos.numeroDocumento || 'N/A'
              };
            }
          }
        } catch (error) {
          console.warn('Error procesando empleado:', error);
        }
      }
    } catch (error) {
      console.warn('Error obteniendo información del médico:', error);
    }

    return { nombre: medicoAsignado, documento: 'N/A' };
  }

  /**
   * Aplicar filtros adicionales a las citas
   * @private
   */
  _aplicarFiltrosAdicionales(cita, filtros) {
    // Filtro por fecha inicio
    if (filtros.fechaInicio) {
      const fechaInicioDate = new Date(filtros.fechaInicio + 'T00:00:00');
      const fechaCita = new Date(cita.fechaAtencion);
      if (fechaCita < fechaInicioDate) return false;
    }

    // Filtro por fecha fin
    if (filtros.fechaFin) {
      const fechaFinDate = new Date(filtros.fechaFin + 'T23:59:59');
      const fechaCita = new Date(cita.fechaAtencion);
      if (fechaCita > fechaFinDate) return false;
    }

    // Filtro por documento de paciente
    if (filtros.documentoPaciente && filtros.documentoPaciente.trim()) {
      if (!cita.documentoPaciente ||
          !cita.documentoPaciente.toLowerCase().includes(filtros.documentoPaciente.toLowerCase())) {
        return false;
      }
    }

    // Filtro por médico
    if (filtros.medico && filtros.medico.trim()) {
      if (!cita.nombreMedico ||
          !cita.nombreMedico.toLowerCase().includes(filtros.medico.toLowerCase())) {
        return false;
      }
    }

    // Filtro por procedimiento
    if (filtros.procedimiento && filtros.procedimiento.trim()) {
      const matchesNombre = cita.nombreProcedimiento &&
        cita.nombreProcedimiento.toLowerCase().includes(filtros.procedimiento.toLowerCase());
      const matchesCodigo = cita.codigoCups &&
        cita.codigoCups.toLowerCase().includes(filtros.procedimiento.toLowerCase());

      if (!matchesNombre && !matchesCodigo) return false;
    }

    return true;
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
      console.warn('Error parseando datos JSON:', error);
      return {};
    }
  }

  /**
   * Filtrar citas que no han sido facturadas
   * @private
   */
  async _filtrarCitasNoFacturadas(citasAtendidas) {
    try {
      // Obtener todas las facturas para verificar cuáles citas ya están facturadas
      const facturasResponse = await this.facturaRepository.getFacturas({
        size: 1000 // Obtener todas las facturas
      });

      if (!facturasResponse || !facturasResponse.content) {
        return citasAtendidas; // Si no hay facturas, todas las citas están disponibles
      }

      // Crear un Set con los IDs de citas que ya están facturadas
      const citasFacturadas = new Set();

      for (const factura of facturasResponse.content) {
        try {
          // Parsear el jsonData correctamente - puede estar doblemente anidado
          let facturaData = {};
          const parsed = this._parseDatosJson(factura.jsonData);
          // Verificar si está doblemente anidado (jsonData dentro de jsonData)
          if (parsed.jsonData) {
            facturaData = this._parseDatosJson(parsed.jsonData);
          } else {
            facturaData = parsed;
          }

          if (facturaData.citas && Array.isArray(facturaData.citas)) {
            // Agregar cada ID de cita facturada al Set
            facturaData.citas.forEach(citaFactura => {
              if (citaFactura.id) {
                citasFacturadas.add(citaFactura.id);
              }
            });
          }
        } catch (error) {
          console.warn(`Error procesando factura ${factura.id} para filtrar citas:`, error);
        }
      }

      // Filtrar citas que no están en el Set de citas facturadas
      const citasNoFacturadas = citasAtendidas.filter(cita => {
        return !citasFacturadas.has(cita.id);
      });

      console.log(`Filtradas ${citasAtendidas.length - citasNoFacturadas.length} citas ya facturadas. Mostrando ${citasNoFacturadas.length} citas disponibles para facturación.`);

      return citasNoFacturadas;

    } catch (error) {
      console.error('Error filtrando citas no facturadas:', error);
      // En caso de error, devolver todas las citas para no bloquear la funcionalidad
      return citasAtendidas;
    }
  }

  /**
   * Parsear fecha de cita de manera segura
   * @private
   */
   _parseFechaCita(cita) {
    try {
      const datosJson = this._parseDatosJson(cita.datosJson);
      return datosJson.fechaHoraCita;
    } catch (error) {
      console.warn(`Error obteniendo fecha de cita ${cita.id}:`, error);
      return new Date(0);
    }
  }
}