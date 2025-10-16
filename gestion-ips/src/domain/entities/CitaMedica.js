/**
 * Entidad de dominio para Cita Médica
 * Representa una cita médica en el sistema
 */
export class CitaMedica {
  constructor({
    id,
    pacienteId,
    medicoAsignado,
    fechaHoraCita,
    motivo,
    estado,
    tipoConsulta,
    codigoCups,
    prioridad,
    notas,
    datosJson,
    fechaCreacion,
    fechaActualizacion
  }) {
    this.id = id;
    this.pacienteId = pacienteId;
    this.medicoAsignado = medicoAsignado;
    this.fechaHoraCita = fechaHoraCita;
    this.motivo = motivo;
    this.estado = estado;
    this.tipoConsulta = tipoConsulta;
    this.codigoCups = codigoCups;
    this.prioridad = prioridad;
    this.notas = notas;
    this.datosJson = datosJson;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Estados posibles de una cita médica
   */
  static ESTADOS = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADA: 'CONFIRMADA',
    ATENDIDO: 'ATENDIDO',
    CANCELADA: 'CANCELADA',
    NO_ASISTIO: 'NO_ASISTIO'
  };

  /**
   * Verifica si la cita está en estado atendido
   */
  estaAtendida() {
    return this.estado === CitaMedica.ESTADOS.ATENDIDO;
  }

  /**
   * Verifica si la cita está pendiente
   */
  estaPendiente() {
    return this.estado === CitaMedica.ESTADOS.PENDIENTE;
  }

  /**
   * Verifica si la cita está cancelada
   */
  estaCancelada() {
    return this.estado === CitaMedica.ESTADOS.CANCELADA;
  }

  /**
   * Obtiene la fecha de la cita formateada
   */
  getFechaFormateada() {
    if (!this.fechaHoraCita) return null;

    try {
      const fecha = new Date(this.fechaHoraCita);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha de cita:', error);
      return null;
    }
  }

  /**
   * Obtiene la hora de la cita formateada
   */
  getHoraFormateada() {
    if (!this.fechaHoraCita) return null;

    try {
      const fecha = new Date(this.fechaHoraCita);
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando hora de cita:', error);
      return null;
    }
  }

  /**
   * Verifica si la cita puede ser facturada
   */
  puedeSerFacturada() {
    return this.estaAtendida() && this.codigoCups;
  }

  /**
   * Obtiene información adicional desde datosJson
   */
  getInformacionAdicional() {
    if (!this.datosJson) return {};

    try {
      return typeof this.datosJson === 'string'
        ? JSON.parse(this.datosJson)
        : this.datosJson;
    } catch (error) {
      console.error('Error parseando datosJson de cita:', error);
      return {};
    }
  }
}

/**
 * Value Object para filtros de citas médicas
 */
export class FiltrosCitaMedica {
  constructor({
    fechaInicio,
    fechaFin,
    estado,
    medicoAsignado,
    pacienteDocumento,
    tipoConsulta,
    prioridad
  }) {
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.estado = estado;
    this.medicoAsignado = medicoAsignado;
    this.pacienteDocumento = pacienteDocumento;
    this.tipoConsulta = tipoConsulta;
    this.prioridad = prioridad;
  }

  /**
   * Verifica si hay filtros activos
   */
  tieneFiltrosActivos() {
    return !!(
      this.fechaInicio ||
      this.fechaFin ||
      this.estado ||
      this.medicoAsignado ||
      this.pacienteDocumento ||
      this.tipoConsulta ||
      this.prioridad
    );
  }

  /**
   * Convierte los filtros a parámetros de consulta
   */
  toQueryParams() {
    const params = {};

    if (this.fechaInicio) params.fechaInicio = this.fechaInicio;
    if (this.fechaFin) params.fechaFin = this.fechaFin;
    if (this.estado) params.estado = this.estado;
    if (this.medicoAsignado) params.medicoAsignado = this.medicoAsignado;
    if (this.pacienteDocumento) params.pacienteDocumento = this.pacienteDocumento;
    if (this.tipoConsulta) params.tipoConsulta = this.tipoConsulta;
    if (this.prioridad) params.prioridad = this.prioridad;

    return params;
  }
}