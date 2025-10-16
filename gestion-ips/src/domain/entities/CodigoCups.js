/**
 * Entidad de dominio para Código CUPS
 * Representa un código de Clasificación Única de Procedimientos en Salud
 */
export class CodigoCups {
  constructor({
    id,
    codigoCup,
    nombreCup,
    descripcion,
    valor,
    categoria,
    subcategoria,
    requiereAutorizacion,
    observaciones,
    datosJson,
    fechaCreacion,
    fechaActualizacion
  }) {
    this.id = id;
    this.codigoCup = codigoCup;
    this.nombreCup = nombreCup;
    this.descripcion = descripcion;
    this.valor = valor;
    this.categoria = categoria;
    this.subcategoria = subcategoria;
    this.requiereAutorizacion = requiereAutorizacion;
    this.observaciones = observaciones;
    this.datosJson = datosJson;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene el valor formateado en pesos colombianos
   */
  getValorFormateado() {
    if (this.valor === null || this.valor === undefined) {
      return 'No definido';
    }

    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(this.valor);
    } catch (error) {
      console.error('Error formateando valor CUPS:', error);
      return 'Error en formato';
    }
  }

  /**
   * Verifica si el código requiere autorización
   */
  requiereAutorizacionEspecial() {
    return this.requiereAutorizacion === true;
  }

  /**
   * Verifica si el código tiene un valor definido
   */
  tieneValorDefinido() {
    return this.valor !== null && this.valor !== undefined && this.valor > 0;
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
      console.error('Error parseando datosJson de código CUPS:', error);
      return {};
    }
  }

  /**
   * Actualiza el valor del código CUPS
   */
  actualizarValor(nuevoValor) {
    if (nuevoValor < 0) {
      throw new Error('El valor no puede ser negativo');
    }
    this.valor = nuevoValor;
    this.fechaActualizacion = new Date().toISOString();
  }

  /**
   * Verifica si el código coincide con un término de búsqueda
   */
  coincideConBusqueda(termino) {
    if (!termino) return true;

    const terminoLower = termino.toLowerCase();
    return (
      this.codigoCup.toLowerCase().includes(terminoLower) ||
      this.nombreCup.toLowerCase().includes(terminoLower) ||
      (this.descripcion && this.descripcion.toLowerCase().includes(terminoLower))
    );
  }
}

/**
 * Value Object para filtros de códigos CUPS
 */
export class FiltrosCodigoCups {
  constructor({
    termino,
    categoria,
    subcategoria,
    tieneValor,
    requiereAutorizacion
  }) {
    this.termino = termino;
    this.categoria = categoria;
    this.subcategoria = subcategoria;
    this.tieneValor = tieneValor;
    this.requiereAutorizacion = requiereAutorizacion;
  }

  /**
   * Verifica si hay filtros activos
   */
  tieneFiltrosActivos() {
    return !!(
      this.termino ||
      this.categoria ||
      this.subcategoria ||
      this.tieneValor !== undefined ||
      this.requiereAutorizacion !== undefined
    );
  }

  /**
   * Convierte los filtros a parámetros de consulta
   */
  toQueryParams() {
    const params = {};

    if (this.termino) params.termino = this.termino;
    if (this.categoria) params.categoria = this.categoria;
    if (this.subcategoria) params.subcategoria = this.subcategoria;
    if (this.tieneValor !== undefined) params.tieneValor = this.tieneValor;
    if (this.requiereAutorizacion !== undefined) params.requiereAutorizacion = this.requiereAutorizacion;

    return params;
  }
}

/**
 * Value Object para actualización de valor CUPS
 */
export class ActualizacionValorCups {
  constructor({
    codigoCupsId,
    nuevoValor,
    motivo,
    usuario
  }) {
    if (nuevoValor < 0) {
      throw new Error('El nuevo valor no puede ser negativo');
    }

    this.codigoCupsId = codigoCupsId;
    this.nuevoValor = nuevoValor;
    this.motivo = motivo;
    this.usuario = usuario;
    this.fechaActualizacion = new Date().toISOString();
  }

  /**
   * Valida que la actualización sea correcta
   */
  esValida() {
    return !!(
      this.codigoCupsId &&
      this.nuevoValor >= 0 &&
      this.usuario
    );
  }
}