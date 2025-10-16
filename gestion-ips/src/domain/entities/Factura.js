/**
 * Entidad de dominio para Factura
 * Representa una factura médica en el sistema
 */
export class Factura {
  constructor({
    id,
    numeroFactura,
    fechaEmision,
    fechaVencimiento,
    paciente,
    citas,
    total,
    subtotal,
    iva,
    descuento,
    estado,
    notas,
    jsonData,
    fechaCreacion,
    fechaActualizacion
  }) {
    this.id = id;
    this.numeroFactura = numeroFactura;
    this.fechaEmision = fechaEmision;
    this.fechaVencimiento = fechaVencimiento;
    this.paciente = paciente;
    this.citas = citas || [];
    this.total = total;
    this.subtotal = subtotal;
    this.iva = iva;
    this.descuento = descuento;
    this.estado = estado;
    this.notas = notas;
    this.jsonData = jsonData;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Estados posibles de una factura
   */
  static ESTADOS = {
    PENDIENTE: 'PENDIENTE',
    PAGADA: 'PAGADA',
    VENCIDA: 'VENCIDA',
    CANCELADA: 'CANCELADA'
  };

  /**
   * Verifica si la factura está pendiente
   */
  estaPendiente() {
    return this.estado === Factura.ESTADOS.PENDIENTE;
  }

  /**
   * Verifica si la factura está pagada
   */
  estaPagada() {
    return this.estado === Factura.ESTADOS.PAGADA;
  }

  /**
   * Verifica si la factura está vencida
   */
  estaVencida() {
    return this.estado === Factura.ESTADOS.VENCIDA;
  }

  /**
   * Calcula el total de la factura basado en las citas
   */
  calcularTotal() {
    if (this.citas && this.citas.length > 0) {
      return this.citas.reduce((total, cita) => total + (cita.valor || 0), 0);
    }
    return this.total || 0;
  }

  /**
   * Obtiene la fecha de emisión formateada
   */
  getFechaEmisionFormateada() {
    if (!this.fechaEmision) return null;

    try {
      const fecha = new Date(this.fechaEmision);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha de emisión:', error);
      return null;
    }
  }

  /**
   * Verifica si la factura puede ser procesada
   */
  puedeSerProcesada() {
    return this.estaPendiente() && this.citas && this.citas.length > 0;
  }

  /**
   * Obtiene información adicional desde jsonData
   */
  getInformacionAdicional() {
    if (!this.jsonData) return {};

    try {
      return typeof this.jsonData === 'string'
        ? JSON.parse(this.jsonData)
        : this.jsonData;
    } catch (error) {
      console.error('Error parseando jsonData de factura:', error);
      return {};
    }
  }

  /**
   * Genera el número de factura si no existe
   */
  generarNumeroFactura() {
    if (!this.numeroFactura) {
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const id = String(this.id || Date.now()).slice(-4);
      this.numeroFactura = `FM-${year}${month}-${id}`;
    }
    return this.numeroFactura;
  }
}

/**
 * Value Object para filtros de facturas
 */
export class FiltrosFactura {
  constructor({
    numeroFactura,
    fechaInicio,
    fechaFin,
    estado,
    pacienteDocumento,
    totalMinimo,
    totalMaximo
  }) {
    this.numeroFactura = numeroFactura;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.estado = estado;
    this.pacienteDocumento = pacienteDocumento;
    this.totalMinimo = totalMinimo;
    this.totalMaximo = totalMaximo;
  }

  /**
   * Verifica si hay filtros activos
   */
  tieneFiltrosActivos() {
    return !!(
      this.numeroFactura ||
      this.fechaInicio ||
      this.fechaFin ||
      this.estado ||
      this.pacienteDocumento ||
      this.totalMinimo ||
      this.totalMaximo
    );
  }

  /**
   * Convierte los filtros a parámetros de consulta
   */
  toQueryParams() {
    const params = {};

    if (this.numeroFactura) params.numeroFactura = this.numeroFactura;
    if (this.fechaInicio) params.fechaInicio = this.fechaInicio;
    if (this.fechaFin) params.fechaFin = this.fechaFin;
    if (this.estado) params.estado = this.estado;
    if (this.pacienteDocumento) params.pacienteDocumento = this.pacienteDocumento;
    if (this.totalMinimo) params.totalMinimo = this.totalMinimo;
    if (this.totalMaximo) params.totalMaximo = this.totalMaximo;

    return params;
  }
}

/**
 * Value Object para detalles de cita en factura
 */
export class DetalleCitaFactura {
  constructor({
    id,
    paciente,
    medico,
    procedimiento,
    codigoCups,
    fechaAtencion,
    valor
  }) {
    this.id = id;
    this.paciente = paciente;
    this.medico = medico;
    this.procedimiento = procedimiento;
    this.codigoCups = codigoCups;
    this.fechaAtencion = fechaAtencion;
    this.valor = valor;
  }

  /**
   * Obtiene la fecha de atención formateada
   */
  getFechaAtencionFormateada() {
    if (!this.fechaAtencion) return null;

    try {
      const fecha = new Date(this.fechaAtencion);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha de atención:', error);
      return null;
    }
  }
}