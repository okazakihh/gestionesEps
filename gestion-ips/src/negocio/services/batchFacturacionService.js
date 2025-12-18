/**
 * batchFacturacionService.js
 * 
 * Servicio para gestión de facturación masiva (batch)
 * Agrupa múltiples citas por cliente para crear facturas consolidadas
 * 
 * Capa: Negocio
 */

/**
 * Agrupa citas por cliente (basado en documento del paciente)
 * @param {Array} citas - Array de citas atendidas
 * @returns {Object} Objeto con citas agrupadas por documento
 */
export const agruparCitasPorCliente = (citas) => {
  const grupos = {};
  
  citas.forEach(cita => {
    const documento = cita.documentoPaciente;
    
    if (!grupos[documento]) {
      grupos[documento] = {
        documento: documento,
        nombrePaciente: cita.nombrePaciente,
        citas: [],
        totalServicios: 0,
        totalValor: 0
      };
    }
    
    grupos[documento].citas.push(cita);
    grupos[documento].totalServicios++;
    grupos[documento].totalValor += cita.valorCita || 0;
  });
  
  return grupos;
};

/**
 * Agrupa citas por entidad pagadora (para facturas a EPS/ARL)
 * @param {Array} citas - Array de citas atendidas
 * @param {string} criterio - 'eps' | 'arl' | 'convenio'
 * @returns {Object} Objeto con citas agrupadas por entidad
 */
export const agruparCitasPorEntidad = (citas, criterio = 'eps') => {
  const grupos = {};
  
  citas.forEach(cita => {
    // Buscar la entidad pagadora en los datos de la cita
    const entidadKey = cita[criterio] || cita.eps || cita.pagador || 'SIN_ASIGNAR';
    
    if (!grupos[entidadKey]) {
      grupos[entidadKey] = {
        entidad: entidadKey,
        pacientes: new Set(),
        citas: [],
        totalServicios: 0,
        totalValor: 0
      };
    }
    
    grupos[entidadKey].pacientes.add(cita.documentoPaciente);
    grupos[entidadKey].citas.push(cita);
    grupos[entidadKey].totalServicios++;
    grupos[entidadKey].totalValor += cita.valorCita || 0;
  });
  
  // Convertir Set a Array para el conteo
  Object.keys(grupos).forEach(key => {
    grupos[key].totalPacientes = grupos[key].pacientes.size;
    grupos[key].pacientes = Array.from(grupos[key].pacientes);
  });
  
  return grupos;
};

/**
 * Agrupa citas por fecha (para facturación periódica)
 * @param {Array} citas - Array de citas atendidas
 * @param {string} periodo - 'dia' | 'semana' | 'mes'
 * @returns {Object} Objeto con citas agrupadas por periodo
 */
export const agruparCitasPorPeriodo = (citas, periodo = 'mes') => {
  const grupos = {};
  
  citas.forEach(cita => {
    const fecha = new Date(cita.fechaAtencion);
    let key;
    
    switch (periodo) {
      case 'dia':
        key = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'semana':
        const semana = getWeekNumber(fecha);
        key = `${fecha.getFullYear()}-W${semana}`;
        break;
      case 'mes':
        key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = fecha.toISOString().split('T')[0];
    }
    
    if (!grupos[key]) {
      grupos[key] = {
        periodo: key,
        fechaInicio: null,
        fechaFin: null,
        citas: [],
        totalServicios: 0,
        totalValor: 0
      };
    }
    
    grupos[key].citas.push(cita);
    grupos[key].totalServicios++;
    grupos[key].totalValor += cita.valorCita || 0;
    
    // Actualizar fechas de inicio y fin
    if (!grupos[key].fechaInicio || fecha < new Date(grupos[key].fechaInicio)) {
      grupos[key].fechaInicio = fecha.toISOString();
    }
    if (!grupos[key].fechaFin || fecha > new Date(grupos[key].fechaFin)) {
      grupos[key].fechaFin = fecha.toISOString();
    }
  });
  
  return grupos;
};

/**
 * Obtener número de semana del año
 * @param {Date} date - Fecha
 * @returns {number} Número de semana
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Genera sugerencias de agrupación inteligente
 * @param {Array} citas - Array de citas atendidas
 * @returns {Object} Sugerencias de agrupación
 */
export const generarSugerenciasAgrupacion = (citas) => {
  const sugerencias = {
    porCliente: {
      grupos: 0,
      ahorro: 0, // Número de facturas que se ahorran
      descripcion: ''
    },
    porEntidad: {
      grupos: 0,
      ahorro: 0,
      descripcion: ''
    },
    porPeriodo: {
      grupos: 0,
      ahorro: 0,
      descripcion: ''
    }
  };
  
  // Analizar agrupación por cliente
  const gruposCliente = agruparCitasPorCliente(citas);
  const clientesConVarias = Object.values(gruposCliente).filter(g => g.citas.length > 1);
  sugerencias.porCliente.grupos = clientesConVarias.length;
  sugerencias.porCliente.ahorro = clientesConVarias.reduce((sum, g) => sum + (g.citas.length - 1), 0);
  sugerencias.porCliente.descripcion = clientesConVarias.length > 0
    ? `${clientesConVarias.length} paciente(s) con múltiples servicios. Ahorra ${sugerencias.porCliente.ahorro} factura(s).`
    : 'No hay pacientes con múltiples servicios';
  
  // Analizar agrupación por entidad
  const gruposEntidad = agruparCitasPorEntidad(citas);
  const entidadesConVarias = Object.values(gruposEntidad).filter(g => g.citas.length > 1);
  sugerencias.porEntidad.grupos = entidadesConVarias.length;
  sugerencias.porEntidad.ahorro = entidadesConVarias.reduce((sum, g) => sum + (g.citas.length - 1), 0);
  sugerencias.porEntidad.descripcion = entidadesConVarias.length > 0
    ? `${entidadesConVarias.length} entidad(es) con múltiples servicios. Ahorra ${sugerencias.porEntidad.ahorro} factura(s).`
    : 'No hay entidades con múltiples servicios';
  
  // Analizar agrupación por mes
  const gruposMes = agruparCitasPorPeriodo(citas, 'mes');
  sugerencias.porPeriodo.grupos = Object.keys(gruposMes).length;
  sugerencias.porPeriodo.ahorro = citas.length - Object.keys(gruposMes).length;
  sugerencias.porPeriodo.descripcion = `${Object.keys(gruposMes).length} periodo(s). Ahorra ${sugerencias.porPeriodo.ahorro} factura(s).`;
  
  return sugerencias;
};

/**
 * Valida si un grupo de citas puede facturarse juntas
 * @param {Array} citas - Array de citas
 * @returns {Object} Resultado de validación { valido, errores }
 */
export const validarGrupoFacturacion = (citas) => {
  const errores = [];
  
  if (!citas || citas.length === 0) {
    errores.push('No hay citas seleccionadas');
    return { valido: false, errores };
  }
  
  // Verificar que todas tengan valores
  const sinValor = citas.filter(c => !c.valorCita || c.valorCita <= 0);
  if (sinValor.length > 0) {
    errores.push(`${sinValor.length} cita(s) sin valor asignado`);
  }
  
  // Verificar que todas tengan código CUPS
  const sinCups = citas.filter(c => !c.codigoCups);
  if (sinCups.length > 0) {
    errores.push(`${sinCups.length} cita(s) sin código CUPS`);
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Formatea los datos del grupo para el formulario de facturación
 * @param {Object} grupo - Grupo de citas
 * @param {string} tipoAgrupacion - 'cliente' | 'entidad' | 'periodo'
 * @returns {Object} Datos formateados para el modal
 */
export const formatearGrupoParaFactura = (grupo, tipoAgrupacion) => {
  return {
    tipoAgrupacion,
    citas: grupo.citas,
    resumen: {
      totalServicios: grupo.totalServicios || grupo.citas.length,
      totalValor: grupo.totalValor,
      totalPacientes: grupo.totalPacientes || 1,
      entidad: grupo.entidad || null,
      periodo: grupo.periodo || null
    }
  };
};
