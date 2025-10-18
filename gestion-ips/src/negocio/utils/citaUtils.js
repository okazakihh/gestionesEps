/**
 * Utilidades para manejo de citas médicas
 */

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns {string} Fecha de hoy
 */
export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Formatea una fecha para mostrar
 * @param {string} dateString - Fecha en string
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Formatea una hora para mostrar
 * @param {string} timeString - Hora en string
 * @returns {string} Hora formateada
 */
export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    // Si viene en formato HH:mm:ss, tomar solo HH:mm
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  } catch (error) {
    return timeString;
  }
};

/**
 * Obtiene el label de estado de cita
 * @param {string} estado - Estado de la cita
 * @returns {Object} {label, color}
 */
export const getEstadoCitaLabel = (estado) => {
  const estados = {
    'PROGRAMADA': { label: 'Programada', color: 'blue' },
    'CONFIRMADA': { label: 'Confirmada', color: 'green' },
    'EN_CURSO': { label: 'En Curso', color: 'yellow' },
    'COMPLETADA': { label: 'Completada', color: 'teal' },
    'CANCELADA': { label: 'Cancelada', color: 'red' },
    'NO_ASISTIO': { label: 'No Asistió', color: 'orange' }
  };
  return estados[estado] || { label: estado, color: 'gray' };
};

/**
 * Obtiene la clase CSS para el estado de la cita
 * @param {string} estado - Estado de la cita
 * @returns {string} Clase CSS
 */
export const getEstadoCitaClass = (estado) => {
  const classes = {
    'PROGRAMADA': 'bg-blue-100 text-blue-800',
    'CONFIRMADA': 'bg-green-100 text-green-800',
    'EN_CURSO': 'bg-yellow-100 text-yellow-800',
    'COMPLETADA': 'bg-teal-100 text-teal-800',
    'CANCELADA': 'bg-red-100 text-red-800',
    'NO_ASISTIO': 'bg-orange-100 text-orange-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

/**
 * Filtra citas según los filtros aplicados
 * @param {Array} citas - Lista de citas
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Citas filtradas
 */
export const filterCitas = (citas, filters) => {
  if (!citas || citas.length === 0) return [];

  return citas.filter(cita => {
    // Filtro por fecha inicio
    if (filters.fechaInicio) {
      const citaDate = new Date(cita.fecha);
      const filterDate = new Date(filters.fechaInicio);
      if (citaDate < filterDate) return false;
    }

    // Filtro por fecha fin
    if (filters.fechaFin) {
      const citaDate = new Date(cita.fecha);
      const filterDate = new Date(filters.fechaFin);
      if (citaDate > filterDate) return false;
    }

    // Filtro por estado
    if (filters.estado && cita.estado !== filters.estado) {
      return false;
    }

    // Filtro por paciente (búsqueda por documento o nombre)
    if (filters.paciente) {
      const searchTerm = filters.paciente.toLowerCase();
      const pacienteMatch = 
        cita.pacienteDocumento?.toLowerCase().includes(searchTerm) ||
        cita.pacienteNombre?.toLowerCase().includes(searchTerm);
      if (!pacienteMatch) return false;
    }

    return true;
  });
};

/**
 * Ordena citas por fecha y hora
 * @param {Array} citas - Lista de citas
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Citas ordenadas
 */
export const sortCitas = (citas, order = 'asc') => {
  if (!citas || citas.length === 0) return [];

  return [...citas].sort((a, b) => {
    const dateA = new Date(`${a.fecha} ${a.hora}`);
    const dateB = new Date(`${b.fecha} ${b.hora}`);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Agrupa citas por fecha
 * @param {Array} citas - Lista de citas
 * @returns {Object} Citas agrupadas por fecha
 */
export const groupCitasByDate = (citas) => {
  if (!citas || citas.length === 0) return {};

  console.log('🗂️ Agrupando citas por fecha. Total:', citas.length);
  if (citas.length > 0) {
    console.log('🗂️ Primera cita completa:', citas[0]);
    console.log('🗂️ Campos de la primera cita:', Object.keys(citas[0]));
  }

  return citas.reduce((groups, cita) => {
    const date = cita.fecha;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(cita);
    return groups;
  }, {});
};

/**
 * Valida si una cita puede ser atendida
 * @param {Object} cita - Cita a validar
 * @returns {Object} {valid, reason}
 */
export const canAtenderCita = (cita) => {
  if (!cita) {
    return { valid: false, reason: 'Cita no válida' };
  }

  if (cita.estado === 'COMPLETADA') {
    return { valid: false, reason: 'La cita ya fue completada' };
  }

  if (cita.estado === 'CANCELADA') {
    return { valid: false, reason: 'La cita fue cancelada' };
  }

  return { valid: true, reason: '' };
};

/**
 * Valida si una cita puede ser cancelada
 * @param {Object} cita - Cita a validar
 * @returns {Object} {valid, reason}
 */
export const canCancelarCita = (cita) => {
  if (!cita) {
    return { valid: false, reason: 'Cita no válida' };
  }

  if (cita.estado === 'COMPLETADA') {
    return { valid: false, reason: 'No se puede cancelar una cita completada' };
  }

  if (cita.estado === 'CANCELADA') {
    return { valid: false, reason: 'La cita ya está cancelada' };
  }

  return { valid: true, reason: '' };
};

/**
 * Obtiene filtros iniciales para citas
 * @returns {Object} Filtros por defecto
 */
export const getInitialFilters = () => ({
  fechaInicio: getTodayDate(),
  fechaFin: getTodayDate(),
  estado: '',
  paciente: ''
});

/**
 * Obtiene información resumida del paciente desde la cita
 * @param {Object} cita - Cita médica
 * @returns {Object} Información del paciente
 */
export const getPatientInfoFromCita = (cita) => {
  return {
    id: cita.pacienteId || null,
    documento: cita.pacienteDocumento || 'N/A',
    nombre: cita.pacienteNombre || 'N/A',
    telefono: cita.pacienteTelefono || 'N/A'
  };
};

/**
 * Normaliza el estado de una cita a su forma estándar
 * @param {string} estado - Estado raw de la cita
 * @returns {string} - Estado normalizado
 */
export const normalizeEstado = (estado) => {
  if (!estado) return 'PROGRAMADO';
  
  // Normalize to uppercase
  const estadoUpper = typeof estado === 'string' ? estado.toUpperCase() : String(estado);
  
  // Map common variations to standard values
  const estadoMapping = {
    'PROGRAMADO': 'PROGRAMADO',
    'PROGRAMADA': 'PROGRAMADO',
    'EN_SALA': 'EN_SALA',
    'EN SALA': 'EN_SALA',
    'ATENDIDO': 'ATENDIDO',
    'ATENDIDA': 'ATENDIDO',
    'COMPLETADO': 'ATENDIDO',
    'COMPLETADA': 'ATENDIDO',
    'NO_SE_PRESENTO': 'NO_SE_PRESENTO',
    'NO SE PRESENTO': 'NO_SE_PRESENTO',
    'NO SE PRESENTÓ': 'NO_SE_PRESENTO',
    'CANCELADO': 'CANCELADO',
    'CANCELADA': 'CANCELADO'
  };
  
  return estadoMapping[estadoUpper] || estadoUpper;
};

/**
 * Parsea los datos JSON de una cita
 * @param {Object} cita - Cita con datosJson
 * @returns {Object} - Información parseada de la cita
 */
export const parseCitaData = (cita) => {
  try {
    if (!cita.datosJson) {
      return getDefaultCitaInfo();
    }

    const citaData = typeof cita.datosJson === 'string' 
      ? JSON.parse(cita.datosJson) 
      : cita.datosJson;

    // Extraer información del CUPS si existe
    const informacionCups = citaData.informacionCups || null;
    
    // Normalizar estado
    const estado = normalizeEstado(citaData.estado);

    return {
      fechaHoraCita: citaData.fechaHoraCita || null,
      motivo: citaData.motivo || 'N/A',
      medicoAsignado: citaData.medicoAsignado || 'N/A',
      estado: estado,
      notas: citaData.notas || 'Sin notas',
      // Priorizar especialidad del CUPS sobre la del formulario
      especialidad: (informacionCups && informacionCups.especialidad) || citaData.especialidad || 'N/A',
      tipoCita: citaData.tipoCita || 'General',
      codigoCups: citaData.codigoCups || null,
      informacionCups: informacionCups
    };
  } catch (error) {
    console.error('Error parsing cita data:', error);
    return getDefaultCitaInfo();
  }
};

/**
 * Obtiene información por defecto de una cita
 * @returns {Object} - Información por defecto
 */
export const getDefaultCitaInfo = () => ({
  fechaHoraCita: null,
  motivo: 'N/A',
  medicoAsignado: 'N/A',
  estado: 'PROGRAMADO',
  notas: 'Sin notas',
  especialidad: 'N/A',
  tipoCita: 'General',
  codigoCups: null,
  informacionCups: null
});
