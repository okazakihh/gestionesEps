/**
 * Caso de uso para crear facturas médicas
 * Application Layer - Use Cases
 */
export class CrearFacturaUseCase {
  constructor(facturaRepository, citaMedicaRepository) {
    this.facturaRepository = facturaRepository;
    this.citaMedicaRepository = citaMedicaRepository;
  }

  /**
   * Ejecuta el caso de uso para crear una factura
   * @param {Object} datosFactura - Datos para crear la factura
   * @param {Array} citasSeleccionadas - IDs de las citas a incluir en la factura
   * @returns {Promise<Object>} Factura creada
   */
  async execute(datosFactura, citasSeleccionadas) {
    try {
      // 1. Validar datos de entrada
      this._validarDatosFactura(datosFactura);
      this._validarCitasSeleccionadas(citasSeleccionadas);

      // 2. Obtener información detallada de las citas
      const citasDetalladas = await this._obtenerCitasDetalladas(citasSeleccionadas);

      // 3. Calcular total de la factura
      const total = this._calcularTotalFactura(citasDetalladas);

      // 4. Generar número de factura
      const numeroFactura = this._generarNumeroFactura();

      // 5. Crear objeto de factura
      const facturaData = {
        numeroFactura,
        fechaEmision: new Date().toISOString(),
        citas: citasDetalladas,
        total,
        subtotal: total,
        iva: 0, // Por ahora sin IVA
        descuento: 0,
        estado: 'PENDIENTE',
        notas: datosFactura.notas || '',
        ...datosFactura
      };

      // 6. Crear factura en el repositorio
      const facturaCreada = await this.facturaRepository.createFactura(facturaData);

      return {
        ...facturaCreada,
        numeroFactura,
        fechaEmision: facturaData.fechaEmision,
        citas: citasDetalladas,
        total,
        estado: 'PENDIENTE'
      };

    } catch (error) {
      console.error('Error en CrearFacturaUseCase:', error);
      throw new Error(`Error al crear la factura: ${error.message}`);
    }
  }

  /**
   * Valida los datos básicos de la factura
   * @private
   */
  _validarDatosFactura(datosFactura) {
    if (!datosFactura) {
      throw new Error('Los datos de la factura son requeridos');
    }

    // Aquí se pueden agregar más validaciones según los requisitos
    // Por ejemplo: validar paciente, fechas, etc.
  }

  /**
   * Valida que las citas seleccionadas sean válidas
   * @private
   */
  _validarCitasSeleccionadas(citasSeleccionadas) {
    if (!citasSeleccionadas || citasSeleccionadas.length === 0) {
      throw new Error('Debe seleccionar al menos una cita para crear la factura');
    }

    if (citasSeleccionadas.length > 50) {
      throw new Error('No se pueden incluir más de 50 citas en una sola factura');
    }
  }

  /**
   * Obtiene información detallada de las citas seleccionadas
   * @private
   */
  async _obtenerCitasDetalladas(citasSeleccionadas) {
    try {
      const citasDetalladas = [];

      for (const citaId of citasSeleccionadas) {
        const cita = await this.citaMedicaRepository.getCitaById(citaId);

        if (!cita) {
          throw new Error(`Cita con ID ${citaId} no encontrada`);
        }

        // Verificar que la cita esté atendida
        const datosJson = this._parseDatosJson(cita.datosJson);
        if (datosJson.estado !== 'ATENDIDO') {
          throw new Error(`La cita ${citaId} no está en estado ATENDIDO`);
        }

        // Obtener información del paciente
        const pacienteInfo = await this._obtenerInformacionPaciente(cita.pacienteId);
        
        // Obtener información del médico
        const medicoInfo = await this._obtenerInformacionMedico(datosJson.medicoAsignado);

        // Obtener valor del CUPS si existe en datosJson
        const valorCita = datosJson.valor || await this._obtenerValorCita(datosJson.codigoCups);

        // Crear objeto de detalle de cita para la factura
        const detalleCita = {
          id: cita.id,
          paciente: {
            nombre: pacienteInfo.nombre,
            documento: pacienteInfo.documento
          },
          medico: {
            nombre: medicoInfo.nombre,
            documento: medicoInfo.documento
          },
          procedimiento: datosJson.descripcion || datosJson.motivo || 'Procedimiento médico',
          codigoCups: datosJson.codigoCups || datosJson.codigoCUPS || 'N/A',
          fechaAtencion: datosJson.fechaHoraCita,
          valor: valorCita
        };

        citasDetalladas.push(detalleCita);
      }

      return citasDetalladas;

    } catch (error) {
      console.error('Error obteniendo citas detalladas:', error);
      throw error;
    }
  }

  /**
   * Calcula el total de la factura basado en las citas
   * @private
   */
  _calcularTotalFactura(citasDetalladas) {
    return citasDetalladas.reduce((total, cita) => {
      return total + (cita.valor || 0);
    }, 0);
  }

  /**
   * Genera un número único de factura
   * @private
   */
  _generarNumeroFactura() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp

    return `FM-${year}${month}-${timestamp}`;
  }

  /**
   * Obtiene información del paciente
   * @private
   */
  async _obtenerInformacionPaciente(pacienteId) {
    if (!pacienteId) {
      return { nombre: 'Paciente no identificado', documento: 'N/A' };
    }

    try {
      // Necesitamos acceder al repositorio de pacientes
      // Asumiendo que tenemos acceso a través del citaMedicaRepository
      const paciente = await this.citaMedicaRepository.pacienteRepository?.getPacienteById(pacienteId);

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
   * Obtiene información del médico
   * @private
   */
  async _obtenerInformacionMedico(medicoId) {
    if (!medicoId) {
      return { nombre: 'Médico no asignado', documento: 'N/A' };
    }

    try {
      // Necesitamos acceder al repositorio de empleados
      const medico = await this.citaMedicaRepository.empleadoRepository?.getEmpleadoById(medicoId);

      if (medico && medico.datosJson) {
        const datosMedico = this._parseDatosJson(medico.datosJson);
        const documentoMedico = medico.numeroDocumento || medico.documento || 'N/A';

        let nombreMedico = 'Médico';
        if (datosMedico.informacionPersonal) {
          const infoPersonal = this._parseDatosJson(datosMedico.informacionPersonal);
          nombreMedico = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || `Médico ${medicoId}`;
        }

        return {
          nombre: nombreMedico,
          documento: documentoMedico
        };
      }
    } catch (error) {
      console.warn(`Error obteniendo información del médico ${medicoId}:`, error);
    }

    return { nombre: `Médico ${medicoId}`, documento: 'N/A' };
  }

  /**
   * Obtiene el valor de una cita basado en el código CUPS
   * @private
   */
  async _obtenerValorCita(codigoCups) {
    // Esta lógica se puede mejorar con un repositorio de CUPS dedicado
    // Por ahora, devolver un valor por defecto o buscar en caché
    if (!codigoCups) return 0;

    // Aquí se debería consultar el repositorio de códigos CUPS
    // Para este ejemplo, devolver un valor por defecto
    return 50000; // Valor por defecto en pesos colombianos
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
}