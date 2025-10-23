// negocio/services/appointmentService.js

/**
 * Servicio de negocio para manejo de citas médicas
 * Centraliza la lógica de negocio relacionada con citas
 */

export const appointmentService = {
  /**
   * Calcula los slots disponibles para una fecha específica
   * @param {Array} appointments - Lista de citas existentes
   * @param {Date} selectedDate - Fecha seleccionada
   * @returns {Array} Lista de slots disponibles
   */
  calculateAvailableSlots: (appointments, selectedDate) => {
    const slots = [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    const isToday = selectedDateOnly.getTime() === today.getTime();

    // Generar slots cada 20 minutos de 6:00 AM a 8:00 PM
    const startHour = 6; // 6:00 AM
    const endHour = 20; // 8:00 PM
    const intervalMinutes = 20;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        // Para la última hora (8:00 PM), solo incluir si es exactamente 8:00
        if (hour === endHour && minute > 0) break;

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        let hour12;
        if (hour === 0) {
          hour12 = 12;
        } else if (hour > 12) {
          hour12 = hour - 12;
        } else {
          hour12 = hour;
        }
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;

        // Si es hoy, verificar que la hora sea futura
        if (isToday) {
          const slotDateTime = new Date(selectedDate);
          slotDateTime.setHours(hour, minute, 0, 0);

          // Solo incluir slots que estén al menos 1 hora en el futuro
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          if (slotDateTime <= oneHourFromNow) {
            continue; // Skip this slot as it's too soon
          }
        }

        slots.push({
          time: timeString,
          label: label
        });
      }
    }

    return slots.map(slot => {
      const slotStartTime = new Date(`${selectedDate.toDateString()} ${slot.time}`);

      // Verificar si este slot específico está ocupado
      const isOccupied = appointments.some(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const appointmentStart = new Date(appointmentData.fechaHoraCita);

          // Verificar si la cita comienza exactamente en este slot
          const appointmentHour = appointmentStart.getHours();
          const appointmentMinute = appointmentStart.getMinutes();
          const slotHour = slotStartTime.getHours();
          const slotMinute = slotStartTime.getMinutes();

          return appointmentHour === slotHour && appointmentMinute === slotMinute;
        } catch (error) {
          console.error('Error parsing appointment for slot calculation:', error);
          return false;
        }
      });

      return {
        ...slot,
        available: !isOccupied
      };
    });
  },

  /**
   * Actualiza el estado de una cita
   * @param {number} appointmentId - ID de la cita
   * @param {string} newStatus - Nuevo estado
   * @returns {Promise} Resultado de la actualización
   */
  updateAppointmentStatus: async (appointmentId, newStatus) => {
    const { pacientesApiService } = await import('../../data/services/pacientesApiService.js');
    return await pacientesApiService.actualizarEstadoCita(appointmentId, newStatus);
  },

  /**
   * Obtiene información detallada de una cita
   * @param {Object} appointment - Objeto de cita
   * @returns {Object} Información procesada de la cita
   */
  getAppointmentInfo: (appointment) => {
    try {
      if (appointment.datosJson) {
        const appointmentData = typeof appointment.datosJson === 'string' ? JSON.parse(appointment.datosJson) : appointment.datosJson;

        // Extraer información del CUPS si existe
        const informacionCups = appointmentData.informacionCups || null;

        // Handle different possible estado formats
        let estado = appointmentData.estado || 'PROGRAMADO';

        // Normalize estado to uppercase for consistency
        if (typeof estado === 'string') {
          estado = estado.toUpperCase();
        }

        // Map common variations to standard values
        const estadoMapping = {
          'PROGRAMADO': 'PROGRAMADO',
          'PROGRAMADA': 'PROGRAMADO',
          'EN_SALA': 'EN_SALA',
          'EN SALA': 'EN_SALA',
          'ATENDIDO': 'ATENDIDO',
          'ATENDIDA': 'ATENDIDO',
          'NO_SE_PRESENTO': 'NO_SE_PRESENTO',
          'NO SE PRESENTO': 'NO_SE_PRESENTO',
          'NO SE PRESENTÓ': 'NO_SE_PRESENTO'
        };

        estado = estadoMapping[estado] || estado;

        // Extraer especialidad del CUPS (tiene prioridad) o del médico asignado
        let especialidad = 'N/A';
        if (informacionCups?.especialidad) {
          especialidad = informacionCups.especialidad;
        } else if (appointmentData.medicoAsignado) {
          // El médico asignado puede incluir la especialidad: "Nombre - Especialidad"
          const medicoParts = appointmentData.medicoAsignado.split(' - ');
          if (medicoParts.length > 1) {
            especialidad = medicoParts[1];
          }
        }

        return {
          fechaHoraCita: appointmentData.fechaHoraCita || null,
          motivo: appointmentData.motivo || 'N/A',
          medicoAsignado: appointmentData.medicoAsignado || 'N/A',
          estado: estado,
          notas: appointmentData.notas || 'Sin notas',
          especialidad: especialidad,
          tipoCita: appointmentData.tipoCita || 'General',
          codigoCups: appointmentData.codigoCups || null,
          informacionCups: informacionCups,
          duracion: appointmentData.duracion || 30 // Duración en minutos
        };
      }
    } catch (error) {
      console.error('Error parsing appointment data for appointment', appointment.id, ':', error);
    }

    return {
      fechaHoraCita: null,
      motivo: 'N/A',
      medicoAsignado: 'N/A',
      estado: 'PROGRAMADO',
      notas: 'Sin notas',
      especialidad: 'N/A',
      tipoCita: 'General',
      codigoCups: null,
      informacionCups: null,
      duracion: 30
    };
  },

  /**
   * Obtiene información del paciente de una cita
   * @param {Object} appointment - Objeto de cita
   * @returns {Promise<Object>} Información del paciente
   */
  getAppointmentPatientInfo: async (appointment) => {
    if (!appointment.pacienteId) {
      return {
        nombre: 'N/A',
        telefono: 'N/A',
        documento: 'N/A',
        estado: 'N/A'
      };
    }

    try {
      const { pacientesApiService } = await import('../../data/services/pacientesApiService.js');
      const patientResponse = await pacientesApiService.getPacienteById(appointment.pacienteId);
      const patientInfo = patientResponse;

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
            documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A',
            estado: patientInfo.activo ? 'Activo' : 'Inactivo'
          };
        }

        // Try flat format (newly created patients)
        if (parsedData.informacionPersonalJson || parsedData.informacionContactoJson) {
          const infoPersonal = parsedData.informacionPersonalJson ? JSON.parse(parsedData.informacionPersonalJson) : {};
          const infoContacto = parsedData.informacionContactoJson ? JSON.parse(parsedData.informacionContactoJson) : {};

          return {
            nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A',
            estado: patientInfo.activo ? 'Activo' : 'Inactivo'
          };
        }
      }
    } catch (error) {
      console.error('Error loading patient data for appointment:', appointment.id, error);
    }

    // Fallback
    return {
      nombre: appointment.patient || 'N/A',
      telefono: 'N/A',
      documento: 'N/A',
      estado: 'N/A'
    };
  },

  /**
   * Verifica si un paciente tiene historia clínica
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<number|null>} ID de la historia clínica o null
   */
  checkPatientHasHistoriaClinica: async (pacienteId) => {
    try {
      const { historiasClinicasApiService } = await import('../../data/services/pacientesApiService.js');
      const historia = await historiasClinicasApiService.getHistoriaClinicaByPaciente(pacienteId);
      return historia ? historia.id : null;
    } catch (error) {
      // 404 significa que no tiene historia clínica, lo cual es normal
      if (error.response && error.response.status === 404) {
        console.log('Paciente no tiene historia clínica:', pacienteId);
        return null;
      }
      // Para otros errores, los propagamos
      throw error;
    }
  },

  /**
   * Obtiene las transiciones de estado disponibles para un estado actual
   * @param {string} currentStatus - Estado actual
   * @returns {Array} Estados disponibles para transición
   */
  getAvailableStatusTransitions: (currentStatus) => {
    const transitions = {
      'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'],
      'EN_SALA': ['ATENDIDO'],
      'ATENDIDO': [],
      'NO_SE_PRESENTO': [],
      'CANCELADA': []
    };
    return transitions[currentStatus] || [];
  },

  /**
   * Obtiene la etiqueta legible de un estado
   * @param {string} status - Estado
   * @returns {string} Etiqueta del estado
   */
  getStatusLabel: (status) => {
    const labels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  },

  /**
   * Formatea una fecha para mostrar
   * @param {string|Date} dateString - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate: (dateString) => {
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
      if (Number.isNaN(date.getTime())) {
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
  }
};