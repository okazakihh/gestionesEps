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

        // Crear objeto de detalle de cita para la factura
        const detalleCita = {
          id: cita.id,
          paciente: await this._obtenerNombrePaciente(cita.pacienteId),
          medico: datosJson.medicoAsignado || 'Médico no asignado',
          procedimiento: datosJson.motivo || 'Procedimiento médico',
          codigoCups: datosJson.codigoCups || 'N/A',
          fechaAtencion: datosJson.fechaHoraCita,
          valor: await this._obtenerValorCita(datosJson.codigoCups)
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
   * Obtiene el nombre del paciente
   * @private
   */
  async _obtenerNombrePaciente(pacienteId) {
    // Esta lógica se puede mejorar con un repositorio de pacientes dedicado
    // Por ahora, devolver un placeholder
    return `Paciente ${pacienteId}`;
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