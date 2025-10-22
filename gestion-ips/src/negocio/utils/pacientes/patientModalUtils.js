// Utilidades para el modal de detalles del paciente

/**
 * Parsea los datos JSON del paciente manejando diferentes formatos
 * @param {Object} patient - Objeto del paciente
 * @returns {Object} Datos parseados del paciente
 */
export const parsePatientData = (patient) => {
  try {
    if (patient?.datosJson) {
      const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

      // Try nested format first (existing patients)
      if (firstLevel.datosJson) {
        const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;
        return {
          ...secondLevel,
          consentimientoInformado: secondLevel.consentimientoInformado || {}
        };
      }

      // Try flat format (newly created patients)
      if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
        return {
          informacionPersonal: firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {},
          informacionContacto: firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {},
          informacionMedica: firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {},
          contactoEmergencia: firstLevel.contactoEmergenciaJson ? JSON.parse(firstLevel.contactoEmergenciaJson) : {},
          consentimientoInformado: firstLevel.consentimientoInformadoJson ? JSON.parse(firstLevel.consentimientoInformadoJson) : {}
        };
      }
    }
  } catch (error) {
    console.error('Error parsing patient data:', error);
  }
  return {};
};

/**
 * Calcula la edad basada en la fecha de nacimiento
 * @param {string} birthDate - Fecha de nacimiento
 * @returns {string} Edad en años o 'N/A'
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A';
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} años`;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Formatea una fecha para mostrar en español colombiano
 * @param {string|Date|Array} dateString - Fecha a formatear
 * @returns {string} Fecha formateada o 'N/A'
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
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
};