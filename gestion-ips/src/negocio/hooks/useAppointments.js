import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { pacientesApiService } from '../../data/services/pacientesApiService';

/**
 * Custom Hook para manejar la lógica de citas/appointments
 * @returns {Object} Estados y funciones para manejar appointments
 */
export const useAppointments = () => {
  // Estados para modales de appointments
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState(null);
  const [appointmentDetailPatientInfo, setAppointmentDetailPatientInfo] = useState(null);
  const [loadingAppointmentDetailPatient, setLoadingAppointmentDetailPatient] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  /**
   * Obtiene información del paciente para una cita
   */
  const getAppointmentPatientInfo = useCallback(async (appointment) => {
    if (!appointment.pacienteId) {
      return {
        nombre: 'N/A',
        telefono: 'N/A',
        documento: 'N/A',
        estado: 'N/A'
      };
    }

    try {
      const patientInfo = await pacientesApiService.getPacienteById(appointment.pacienteId);

      if (patientInfo.datosJson) {
        const parsedData = typeof patientInfo.datosJson === 'string' 
          ? JSON.parse(patientInfo.datosJson) 
          : patientInfo.datosJson;

        // Try nested format first (existing patients)
        if (parsedData.datosJson) {
          const secondLevel = typeof parsedData.datosJson === 'string' 
            ? JSON.parse(parsedData.datosJson) 
            : parsedData.datosJson;
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
          const infoPersonal = parsedData.informacionPersonalJson 
            ? JSON.parse(parsedData.informacionPersonalJson) 
            : {};
          const infoContacto = parsedData.informacionContactoJson 
            ? JSON.parse(parsedData.informacionContactoJson) 
            : {};

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
  }, []);

  /**
   * Obtiene información de una cita
   */
  const getAppointmentInfo = useCallback((appointment) => {
    try {
      // Parse appointment data if it's in datosJson
      let appointmentData = { ...appointment };

      if (appointment.datosJson) {
        const parsedData = typeof appointment.datosJson === 'string'
          ? JSON.parse(appointment.datosJson)
          : appointment.datosJson;
        appointmentData = { ...appointmentData, ...parsedData };
      }

      // Extract from fechaHoraCita if exists
      let fecha = '';
      let hora = '';
      if (appointmentData.fechaHoraCita) {
        // Handle different date formats from backend
        let dateObj;
        if (Array.isArray(appointmentData.fechaHoraCita) && appointmentData.fechaHoraCita.length >= 6) {
          // LocalDateTime as array [year, month, day, hour, minute, second, nanosecond]
          dateObj = new Date(appointmentData.fechaHoraCita[0], appointmentData.fechaHoraCita[1] - 1, appointmentData.fechaHoraCita[2], appointmentData.fechaHoraCita[3], appointmentData.fechaHoraCita[4], appointmentData.fechaHoraCita[5]);
        } else if (typeof appointmentData.fechaHoraCita === 'string') {
          dateObj = new Date(appointmentData.fechaHoraCita);
        } else {
          dateObj = new Date(appointmentData.fechaHoraCita);
        }

        if (!isNaN(dateObj.getTime())) {
          fecha = dateObj.toISOString().split('T')[0];
          hora = dateObj.toTimeString().substring(0, 5);
        }
      }

      // Extract especialidad from informacionCups if available
      let especialidad = appointmentData.especialidad || appointment.especialidad || 'N/A';
      if (appointmentData.informacionCups && appointmentData.informacionCups.especialidad) {
        especialidad = appointmentData.informacionCups.especialidad;
      } else if (appointmentData.medicoAsignado) {
        // El médico asignado puede incluir la especialidad: "Nombre - Especialidad"
        const medicoParts = appointmentData.medicoAsignado.split(' - ');
        if (medicoParts.length > 1) {
          especialidad = medicoParts[1];
        }
      }

      return {
        id: appointment.id,
        estado: appointmentData.estado || appointment.estado || 'PROGRAMADO',
        fechaHoraCita: appointmentData.fechaHoraCita || appointment.fechaHoraCita || null,
        fecha: fecha || appointment.fecha || 'N/A',
        hora: hora || appointment.hora || 'N/A',
        especialidad: especialidad,
        medicoAsignado: appointmentData.medicoAsignado || appointment.medicoAsignado || 'N/A',
        tipoCita: appointmentData.tipoCita || appointment.tipoCita || 'General',
        motivo: appointmentData.motivo || appointment.motivo || 'Sin especificar',
        duracion: appointmentData.duracion || appointment.duracion || 30,
        notas: appointmentData.notas || appointment.notas || 'Sin notas',
        codigoCups: appointmentData.codigoCups || appointment.codigoCups || null,
        informacionCups: appointmentData.informacionCups || appointment.informacionCups || null
      };
    } catch (error) {
      console.error('Error parsing appointment info:', error);
      return {
        id: appointment.id,
        estado: appointment.estado || 'PROGRAMADO',
        fechaHoraCita: null,
        fecha: 'N/A',
        hora: 'N/A',
        especialidad: 'N/A',
        medicoAsignado: 'N/A',
        tipoCita: 'General',
        motivo: 'Sin especificar',
        duracion: 30,
        notas: 'Sin notas',
        codigoCups: null,
        informacionCups: null
      };
    }
  }, []);

  /**
   * Obtiene las transiciones de estado disponibles para una cita
   */
  const getAvailableStatusTransitions = useCallback((currentStatus) => {
    const statusFlow = {
      'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'],
      'EN_SALA': ['ATENDIDO'],
      'ATENDIDO': [],
      'NO_SE_PRESENTO': [],
      'CANCELADA': []
    };

    return statusFlow[currentStatus] || [];
  }, []);

  /**
   * Obtiene la etiqueta de un estado
   */
  const getStatusLabel = useCallback((status) => {
    const statusLabels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelada'
    };

    return statusLabels[status] || status;
  }, []);

  /**
   * Maneja la visualización del detalle de una cita
   */
  const handleViewAppointmentDetail = useCallback(async (appointment) => {
    setSelectedAppointmentForDetail(appointment);
    setIsAppointmentDetailModalOpen(true);

    // Load patient information
    if (appointment.pacienteId) {
      try {
        setLoadingAppointmentDetailPatient(true);
        const patientInfo = await getAppointmentPatientInfo(appointment);
        setAppointmentDetailPatientInfo(patientInfo);
      } catch (error) {
        console.error('Error loading patient info for appointment detail:', error);
        setAppointmentDetailPatientInfo({
          nombre: 'Error al cargar',
          telefono: 'N/A',
          documento: 'N/A',
          estado: 'N/A'
        });
      } finally {
        setLoadingAppointmentDetailPatient(false);
      }
    }
  }, [getAppointmentPatientInfo]);

  /**
   * Cierra el modal de detalle de cita
   */
  const handleCloseAppointmentDetailModal = useCallback(() => {
    setIsAppointmentDetailModalOpen(false);
    setSelectedAppointmentForDetail(null);
    setAppointmentDetailPatientInfo(null);
    setLoadingAppointmentDetailPatient(false);
  }, []);

  /**
   * Actualiza el estado de una cita
   */
  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

    try {
      // Llamada a la API para actualizar el estado
      const response = await pacientesApiService.actualizarEstadoCita(appointmentId, newStatus);

      await Swal.fire({
        title: '¡Estado Actualizado!',
        text: `La cita ha sido actualizada a: ${getStatusLabel(newStatus)}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating appointment status:', error);

      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado de la cita',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });

      return { success: false, error: error.message };
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  }, [getStatusLabel]);

  return {
    // Estados
    isAppointmentDetailModalOpen,
    selectedAppointmentForDetail,
    appointmentDetailPatientInfo,
    loadingAppointmentDetailPatient,
    updatingStatus,
    
    // Funciones
    getAppointmentPatientInfo,
    getAppointmentInfo,
    getAvailableStatusTransitions,
    getStatusLabel,
    handleViewAppointmentDetail,
    handleCloseAppointmentDetailModal,
    updateAppointmentStatus
  };
};
