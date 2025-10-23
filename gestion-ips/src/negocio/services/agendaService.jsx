/**
 * Servicio de negocio para la gestión de la agenda médica
 * Contiene la lógica de negocio relacionada con citas médicas
 */

/**
 * Obtiene la información parseada de una cita
 * @param {Object} cita - Objeto de cita
 * @returns {Object} Información parseada de la cita
 */
export const parseCitaInfo = (cita) => {
  try {
    if (cita.datosJson) {
      const citaData = typeof cita.datosJson === 'string' ? JSON.parse(cita.datosJson) : cita.datosJson;
      console.log('Parsed citaData for cita', cita.id, ':', citaData);

      // Extraer información del CUPS si existe
      const informacionCups = citaData.informacionCups || null;
      console.log('Información CUPS para cita', cita.id, ':', informacionCups);

      // Handle different possible estado formats
      let estado = citaData.estado || 'PROGRAMADO';
      console.log('Raw estado for cita', cita.id, ':', estado);

      // Normalize estado to uppercase for consistency
      if (typeof estado === 'string') {
        estado = estado.toUpperCase();
      }

      // Map common variations to standard values
      const estadoMapping = {
        'PROGRAMADO': 'PROGRAMADO',
        'PROGRAMADA': 'PROGRAMADO', // feminine form
        'EN_SALA': 'EN_SALA',
        'EN SALA': 'EN_SALA',
        'ATENDIDO': 'ATENDIDO',
        'ATENDIDA': 'ATENDIDO', // feminine form
        'NO_SE_PRESENTO': 'NO_SE_PRESENTO',
        'NO SE PRESENTO': 'NO_SE_PRESENTO',
        'NO SE PRESENTÓ': 'NO_SE_PRESENTO'
      };

      estado = estadoMapping[estado] || estado;
      console.log('Normalized estado for cita', cita.id, ':', estado);

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
    }
  } catch (error) {
    console.error('Error parsing cita data for cita', cita.id, ':', error);
  }

  console.log('Using default estado for cita', cita.id, ': PROGRAMADO');
  return {
    fechaHoraCita: null,
    motivo: 'N/A',
    medicoAsignado: 'N/A',
    estado: 'PROGRAMADO',
    notas: 'Sin notas',
    especialidad: 'N/A',
    tipoCita: 'General',
    codigoCups: null,
    informacionCups: null
  };
};

/**
 * Obtiene la información parseada de un paciente
 * @param {Object} cita - Objeto de cita
 * @param {Object} patientData - Datos de pacientes cargados
 * @param {Object} loadingPatients - Estados de carga de pacientes
 * @returns {Object} Información del paciente
 */
export const parsePacienteInfo = (cita, patientData, loadingPatients) => {
  const patientInfo = patientData[cita.pacienteId];

  if (patientInfo) {
    try {
      // Parse patient data from the loaded patient information
      if (patientInfo.datosJson) {
        const parsedData = typeof patientInfo.datosJson === 'string' ? JSON.parse(patientInfo.datosJson) : patientInfo.datosJson;

        // Try nested format first (existing patients)
        if (parsedData.datosJson) {
          const secondLevel = typeof parsedData.datosJson === 'string' ? JSON.parse(parsedData.datosJson) : parsedData.datosJson;
          const infoPersonal = secondLevel.informacionPersonal || {};
          const infoContacto = secondLevel.informacionContacto || {};

          return {
            nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A'
          };
        }

        // Try flat format (newly created patients)
        if (parsedData.informacionPersonalJson || parsedData.informacionContactoJson) {
          const infoPersonal = parsedData.informacionPersonalJson ? JSON.parse(parsedData.informacionPersonalJson) : {};
          const infoContacto = parsedData.informacionContactoJson ? JSON.parse(parsedData.informacionContactoJson) : {};

          return {
            nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing paciente data:', error);
    }
  }

  // Fallback to basic patient info from the cita
  return {
    nombre: cita.pacienteNombre || 'N/A',
    telefono: loadingPatients[cita.pacienteId] ? 'Cargando...' : 'N/A',
    documento: loadingPatients[cita.pacienteId] ? 'Cargando...' : 'N/A'
  };
};

/**
 * Filtra las citas según los criterios especificados
 * @param {Array} citas - Lista de citas
 * @param {Object} filters - Filtros a aplicar
 * @param {Object} user - Usuario actual
 * @returns {Array} Citas filtradas
 */
export const filterCitas = (citas, filters, user) => {
  // Start with all citas, not just pending ones
  let filtered = [...citas];

  // Filter by date range
  if (filters.fechaInicio) {
    const startDate = new Date(filters.fechaInicio);
    filtered = filtered.filter(cita => {
      const citaInfo = parseCitaInfo(cita);
      if (!citaInfo.fechaHoraCita) return false;
      const citaDate = new Date(citaInfo.fechaHoraCita);
      return citaDate >= startDate;
    });
  }

  if (filters.fechaFin) {
    const endDate = new Date(filters.fechaFin);
    endDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(cita => {
      const citaInfo = parseCitaInfo(cita);
      if (!citaInfo.fechaHoraCita) return false;
      const citaDate = new Date(citaInfo.fechaHoraCita);
      return citaDate <= endDate;
    });
  }

  // Filter by status
  if (filters.estado) {
    filtered = filtered.filter(cita => {
      const citaInfo = parseCitaInfo(cita);
      return citaInfo.estado === filters.estado;
    });
  }

  // Filter by patient
  if (filters.paciente) {
    filtered = filtered.filter(cita => {
      const pacienteInfo = parsePacienteInfo(cita, {}, {});
      const searchTerm = filters.paciente.toLowerCase();
      const nombre = pacienteInfo.nombre?.toLowerCase() || '';
      const documento = pacienteInfo.documento?.toLowerCase() || '';
      const telefono = pacienteInfo.telefono?.toLowerCase() || '';

      return nombre.includes(searchTerm) ||
             documento.includes(searchTerm) ||
             telefono.includes(searchTerm);
    });
  }

  return filtered;
};

/**
 * Obtiene las citas pendientes según el rol del usuario
 * @param {Array} citas - Lista de citas
 * @param {Object} user - Usuario actual
 * @returns {Array} Citas pendientes filtradas por rol
 */
export const getPendingCitas = (citas, user) => {
  return citas.filter(cita => {
    const citaInfo = parseCitaInfo(cita);

    // First filter by status
    const statusMatch = citaInfo.estado === 'PROGRAMADO' || citaInfo.estado === 'EN_SALA';
    if (!statusMatch) return false;

    // Then filter by user role permissions
    if (user?.rol === 'DOCTOR' || user?.rol === 'AUXILIAR_MEDICO') {
      // Doctors only see appointments assigned to them
      const assignedDoctor = citaInfo.medicoAsignado;
      const currentUserName = `${user.nombres} ${user.apellidos}`.trim();
      return assignedDoctor && (
        assignedDoctor.toLowerCase().includes(currentUserName.toLowerCase()) ||
        assignedDoctor.toLowerCase().includes(user.nombres.toLowerCase()) ||
        assignedDoctor.toLowerCase().includes(user.apellidos.toLowerCase())
      );
    }

    // Administrative roles see all appointments
    return true;
  });
};

/**
 * Obtiene las transiciones de estado disponibles para un estado dado
 * @param {string} currentStatus - Estado actual
 * @param {Object} user - Usuario actual
 * @param {Object} permissions - Permisos del usuario
 * @returns {Array} Transiciones disponibles
 */
export const getAvailableStatusTransitions = (currentStatus, user, permissions) => {
  const baseTransitions = {
    'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADO'],
    'EN_SALA': ['ATENDIDO', 'CANCELADO'],
    'ATENDIDO': [],
    'NO_SE_PRESENTO': [],
    'CANCELADO': [] // No permitir transiciones desde CANCELADO
  };

  const availableTransitions = baseTransitions[currentStatus] || [];

  // Filter out ATENDIDO if user doesn't have permission to mark as attended
  return availableTransitions.filter(transition => {
    if (transition === 'ATENDIDO') {
      return permissions?.pacientes?.mark_attended;
    }
    return true;
  });
};

/**
 * Obtiene la etiqueta de estado
 * @param {string} status - Estado
 * @returns {string} Etiqueta del estado
 */
export const getStatusLabel = (status) => {
  const labels = {
    'PROGRAMADO': 'Programado',
    'EN_SALA': 'En Sala',
    'ATENDIDO': 'Atendido',
    'NO_SE_PRESENTO': 'No se Presentó',
    'CANCELADO': 'Cancelado'
  };
  return labels[status] || status;
};

/**
 * Obtiene el color de estado para clases CSS
 * @param {string} status - Estado
 * @returns {string} Clase CSS del color
 */
export const getStatusColor = (status) => {
  const colors = {
    'PROGRAMADO': 'bg-blue-100 text-blue-800',
    'EN_SALA': 'bg-yellow-100 text-yellow-800',
    'ATENDIDO': 'bg-green-100 text-green-800',
    'NO_SE_PRESENTO': 'bg-red-100 text-red-800',
    'CANCELADO': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtiene el ícono SVG para un estado
 * @param {string} status - Estado
 * @returns {JSX.Element|null} Elemento SVG del ícono
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'PROGRAMADO':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'EN_SALA':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'ATENDIDO':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'NO_SE_PRESENTO':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'CANCELADO':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(dateString) && dateString.length >= 6) {
      // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
      date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
    } else if (typeof dateString === 'string') {
      // Try different parsing strategies
      if (dateString.includes('T')) {
        // ISO format with time: "2024-12-15T10:30:00.000+00:00"
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Date only format: "2024-12-15"
        date = new Date(dateString + 'T00:00:00');
      } else {
        // Other string formats
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
};