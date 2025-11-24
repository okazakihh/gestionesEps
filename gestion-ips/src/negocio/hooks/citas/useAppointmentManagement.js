// hooks/useAppointmentManagement.js
import { useState, useEffect } from 'react';
import { pacientesApiService } from '../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

export const useAppointmentManagement = (user = null) => {
  // Estados para citas
  const [selectedDate, setSelectedDate] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [allDoctorAppointments, setAllDoctorAppointments] = useState({});
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Estados para modales de citas
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState(null);
  const [selectedSlotForAppointment, setSelectedSlotForAppointment] = useState(null);

  // Estados para detalle de citas
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState(null);
  const [appointmentDetailPatientInfo, setAppointmentDetailPatientInfo] = useState(null);
  const [loadingAppointmentDetailPatient, setLoadingAppointmentDetailPatient] = useState(false);

  // Estados para atención médica
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false);
  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);
  const [historiaClinicaId, setHistoriaClinicaId] = useState(null);

  // Funciones de estado de citas
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'],
      'EN_SALA': ['ATENDIDO'],
      'ATENDIDO': [],
      'NO_SE_PRESENTO': [],
      'CANCELADA': []
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  };

  // Función para actualizar estado de cita
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

      const response = await pacientesApiService.actualizarEstadoCita(appointmentId, newStatus);

      // Update the appointment in the local state (allDoctorAppointments structure)
      setAllDoctorAppointments(prevDoctorAppointments => {
        const updatedDoctorAppointments = { ...prevDoctorAppointments };

        // Find and update the appointment in the grouped structure
        Object.keys(updatedDoctorAppointments).forEach(doctorId => {
          const doctorData = updatedDoctorAppointments[doctorId];
          const appointmentIndex = doctorData.appointments.findIndex(apt => apt.id === appointmentId);

          if (appointmentIndex !== -1) {
            // Update the appointment status in the datosJson
            const updatedAppointment = { ...doctorData.appointments[appointmentIndex] };
            const appointmentData = JSON.parse(updatedAppointment.datosJson || '{}');
            appointmentData.estado = newStatus;
            updatedAppointment.datosJson = JSON.stringify(appointmentData);
            updatedAppointment.status = newStatus;

            // Update the appointment in the array
            doctorData.appointments[appointmentIndex] = updatedAppointment;
          }
        });

        return updatedDoctorAppointments;
      });

      // Show success message with SweetAlert2
      const statusLabels = {
        'EN_SALA': 'En Sala',
        'ATENDIDO': 'Atendido',
        'NO_SE_PRESENTO': 'No se Presentó',
        'CANCELADA': 'Cancelada'
      };

      await Swal.fire({
        icon: 'success',
        title: '¡Estado Actualizado!',
        text: `La cita ha sido cambiada a "${statusLabels[newStatus] || newStatus}" exitosamente.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      console.log(`Estado de cita ${appointmentId} actualizado a ${newStatus}`);

      // Si se cambió el estado de la cita, recargar los datos del calendario para actualizar los slots disponibles
      if (selectedDate) {
        await loadAllDoctorsData(selectedDate);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);

      // Show error message with SweetAlert2
      const errorMessage = error.message || 'Error desconocido';

      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar Estado',
        text: `No se pudo actualizar el estado de la cita. ${errorMessage}`,
        confirmButtonColor: '#EF4444',
        footer: 'Por favor, verifica que la transición de estado sea válida.'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Función para manejar atención de cita
  const handleAtendidoClick = async (appointment) => {
    // Cargar datos del paciente antes de abrir el modal
    let appointmentWithPatientData = { ...appointment };
    
    try {
      const { pacientesApiService } = await import('../../../data/services/pacientesApiService.js');
      const patientData = await pacientesApiService.getPacienteById(appointment.pacienteId);
      appointmentWithPatientData.patientData = patientData;
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
    
    setCurrentAppointment(appointmentWithPatientData);

    // Verificar el estado actual de la cita
    const currentStatus = appointment.datosJson ? JSON.parse(appointment.datosJson).estado : 'PROGRAMADO';

    // Actualizar el estado de la cita a EN_SALA solo si está en PROGRAMADO
    if (currentStatus === 'PROGRAMADO') {
      await updateAppointmentStatus(appointment.id, 'EN_SALA');
    }

    // Verificar si el paciente tiene historia clínica
    const historiaId = await checkPatientHasHistoriaClinica(appointment.pacienteId);
    setHistoriaClinicaId(historiaId);

    if (historiaId) {
      // Tiene historia clínica, mostrar formulario de consulta
      setIsConsultaModalOpen(true);
    } else {
      // No tiene historia clínica, mostrar formulario de historia clínica
      setIsHistoriaModalOpen(true);
    }
  };

  // Función para forzar recarga de datos del calendario
  const refreshCalendarData = async () => {
    if (selectedDate) {
      await loadAllDoctorsData(selectedDate);
    }
  };

  // Función para verificar si el paciente tiene historia clínica
  const checkPatientHasHistoriaClinica = async (pacienteId) => {
    try {
      const { historiasClinicasApiService } = await import('../../../data/services/pacientesApiService.js');
      const historia = await historiasClinicasApiService.getHistoriaClinicaByPaciente(pacienteId);
      return historia ? historia.id : null;
    } catch (error) {
      // Si hay error (diferente de 404), asumimos que no tiene historia clínica
      return null;
    }
  };

  // Función para cargar médicos
  const loadMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const { empleadosApiService } = await import('../../../data/services/empleadosApiService.js');
      const response = await empleadosApiService.getEmpleados({ size: 1000 });
      const empleados = response.content || [];

      // Filter employees that are medical doctors
      let medicosFiltrados = empleados.filter(empleado => {
        try {
          const datosCompletos = JSON.parse(empleado.jsonData || '{}');
          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            const informacionLaboral = datosInternos.informacionLaboral || {};
            return informacionLaboral.tipoPersonal === 'MEDICO' && informacionLaboral.tipoMedico === 'DOCTOR';
          }
          return false;
        } catch (error) {
          console.error('Error parsing employee data:', error);
          return false;
        }
      });

      setMedicos(medicosFiltrados);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingMedicos(false);
    }
  };

  // Cargar médicos al inicializar el hook
  useEffect(() => {
    loadMedicos();
  }, []);

  // Función para cargar todas las citas de médicos
  const loadAllDoctorsData = async (date, disponibilidadesGenerales) => {
    if (!date) return;

    try {
      // Asegurarse de que los médicos estén cargados ANTES de continuar.
      await loadMedicos();

      setLoadingAppointments(true);

      // 1. Cargar disponibilidades para la fecha seleccionada
      const fechaFormato = date.toISOString().split('T')[0];
      let medicosDisponiblesIds = new Set();
      let disponibilidadesParaFecha = [];
      try {
        // Se filtran en el frontend por la fecha seleccionada
        disponibilidadesParaFecha = (disponibilidadesGenerales || []).filter(disp => {
          const datos = JSON.parse(disp.datosJson || '{}');
          return datos.fecha === fechaFormato;
        });

        disponibilidadesParaFecha.forEach(disp => {
          const datos = JSON.parse(disp.datosJson || '{}');
          if (datos.doctorId) {
            medicosDisponiblesIds.add(datos.doctorId.toString());
          }
        });

      } catch (error) {
        console.warn('No se encontraron disponibilidades para la fecha o hubo un error:', error);
      }
      // Load all appointments
      const appointmentsResponse = await pacientesApiService.getCitas({ size: 1000 });
      const allAppointments = appointmentsResponse.content || [];

      // Filter by date if specified
      let filteredAppointments = allAppointments;
      if (date) {
        // Create date range for the selected day (start to end of day)
        const selectedDateStart = new Date(date);
        selectedDateStart.setHours(0, 0, 0, 0);

        const selectedDateEnd = new Date(date);
        selectedDateEnd.setHours(23, 59, 59, 999);

        filteredAppointments = allAppointments.filter(appointment => {
          try {
            const appointmentData = JSON.parse(appointment.datosJson || '{}');
            const appointmentDateTime = appointmentData.fechaHoraCita;
            if (!appointmentDateTime) return false;

            // Handle different date formats from backend
            let appointmentDate;
            if (Array.isArray(appointmentDateTime) && appointmentDateTime.length >= 6) {
              // LocalDateTime as array [year, month, day, hour, minute, second, nanosecond]
              appointmentDate = new Date(appointmentDateTime[0], appointmentDateTime[1] - 1, appointmentDateTime[2], appointmentDateTime[3], appointmentDateTime[4], appointmentDateTime[5]);
            } else {
              appointmentDate = new Date(appointmentDateTime);
            }

            // Check if appointment date falls within the selected day
            return appointmentDate >= selectedDateStart && appointmentDate <= selectedDateEnd;
          } catch (error) {
            console.error('Error parsing appointment date:', error);
            return false;
          }
        });
      }

      // Get unique patient IDs from filtered appointments
      const patientIds = [...new Set(filteredAppointments
        .map(apt => apt.pacienteId)
        .filter(id => id))];

      // Load patient details for these IDs
      const patientsData = [];
      if (patientIds.length > 0) {
        for (const patientId of patientIds) {
          try {
            const patientResponse = await pacientesApiService.getPacienteById(patientId);
            patientsData.push(patientResponse);
          } catch (error) {
            console.error(`Error loading patient ${patientId}:`, error);
          }
        }
      }

      // Create a map of doctor names to doctor objects
      // Also create a map by base name (without specialty) for flexible matching
      const doctorMap = {};
      const doctorMapByBaseName = {};
      medicos.forEach(medico => {
        const doctorName = getNombreCompletoMedico(medico);
        doctorMap[doctorName] = medico;
        
        // Extract base name (everything before the last dash and specialty)
        const baseName = doctorName.split(' - ')[0]?.trim();
        if (baseName) {
          doctorMapByBaseName[baseName] = medico;
        }
      });

      // 1. Identificar médicos con disponibilidad para la fecha
      const medicosConDisponibilidad = medicos.filter(medico =>
        medicosDisponiblesIds.has(medico.id.toString())
      );

      // 2. Filtrar esa lista según el rol del usuario
      let medicosAMostrar = medicosConDisponibilidad;
      if (user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')) {
        // Si es doctor o auxiliar médico, solo mostrar sus propias citas
        const currentUserName = `${user.nombres} ${user.apellidos}`.trim();
        medicosAMostrar = medicosConDisponibilidad.filter(medico => {
          const doctorName = getNombreCompletoMedico(medico);
          return doctorName && (
            doctorName.toLowerCase().includes(currentUserName.toLowerCase()) ||
            doctorName.toLowerCase().includes(user.nombres.toLowerCase()) ||
            doctorName.toLowerCase().includes(user.apellidos.toLowerCase())
          );
        });
      }

      // 3. Inicializar `groupedAppointments` solo para médicos con disponibilidad
      const groupedAppointments = {};
      medicosAMostrar.forEach(medico => {
        const doctorName = getNombreCompletoMedico(medico);
        groupedAppointments[medico.id] = {
          doctor: medico,
          doctorName: doctorName,
          appointments: [],
          disponibilidades: [] // Se llenará más adelante
        };
      });

      // Group appointments by doctor
      filteredAppointments.forEach(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const medicoAsignado = appointmentData.medicoAsignado;
          
          // Try exact match first, then try matching by base name (without specialty)
          let doctor = doctorMap[medicoAsignado];
          
          if (!doctor && medicoAsignado) {
            // Extract base name from the assigned doctor
            const baseNameFromAppointment = medicoAsignado.split(' - ')[0]?.trim();
            if (baseNameFromAppointment) {
              doctor = doctorMapByBaseName[baseNameFromAppointment];
            }
          }

          if (medicoAsignado && doctor) {
            const doctorId = doctor.id;

            // Get patient name
            let patientName = appointmentData.motivo || 'Paciente';
            if (appointment.pacienteId) {
              const patientData = patientsData.find(p => p.id == appointment.pacienteId);
              if (patientData) {
                try {
                  const datosCompletos = JSON.parse(patientData.datosJson || '{}');
                  const personalInfo = JSON.parse(datosCompletos.informacionPersonalJson || '{}');
                  const fullName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim();
                  if (fullName && fullName !== ' ') {
                    patientName = fullName;
                  }
                } catch (error) {
                  console.error('Error parsing patient name for appointment:', appointment.id, error);
                }
              }
            }

            // Handle different date formats for display
            let appointmentDateTime;
            if (Array.isArray(appointmentData.fechaHoraCita) && appointmentData.fechaHoraCita.length >= 6) {
              // LocalDateTime as array [year, month, day, hour, minute, second, nanosecond]
              appointmentDateTime = new Date(appointmentData.fechaHoraCita[0], appointmentData.fechaHoraCita[1] - 1, appointmentData.fechaHoraCita[2], appointmentData.fechaHoraCita[3], appointmentData.fechaHoraCita[4], appointmentData.fechaHoraCita[5]);
            } else {
              appointmentDateTime = new Date(appointmentData.fechaHoraCita);
            }

            groupedAppointments[doctorId].appointments.push({
              id: appointment.id,
              time: appointmentDateTime.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              patient: patientName,
              status: appointmentData.estado || 'PROGRAMADA',
              pacienteId: appointment.pacienteId,
              datosJson: appointment.datosJson,
              fechaCreacion: appointment.fechaCreacion
            });
          }
        } catch (error) {
          console.error('Error processing appointment:', appointment.id, error);
        }
      });

      // Volver a cargar disponibilidades y agruparlas por doctor
      try {
        // Usamos las disponibilidades ya filtradas por fecha
        disponibilidadesParaFecha.forEach(disp => {
          const datos = JSON.parse(disp.datosJson || '{}');
          if (datos.doctorId && groupedAppointments[datos.doctorId]) {
            if (!groupedAppointments[datos.doctorId].disponibilidades) {
              groupedAppointments[datos.doctorId].disponibilidades = [];
            }
            groupedAppointments[datos.doctorId].disponibilidades.push(disp);
          }
        });
      } catch (error) { /* ya manejado */ }
      setAllDoctorAppointments(groupedAppointments);

    } catch (error) {
      console.error('Error loading all doctors data:', error);
      setAllDoctorAppointments({});
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Función auxiliar para obtener nombre completo del médico
  const getNombreCompletoMedico = (medico) => {
    try {
      const datosCompletos = JSON.parse(medico.jsonData || '{}');
      if (datosCompletos.jsonData) {
        const datosInternos = JSON.parse(datosCompletos.jsonData);
        const informacionPersonal = datosInternos.informacionPersonal || {};
        const informacionLaboral = datosInternos.informacionLaboral || {};

        const primerNombre = informacionPersonal.primerNombre || '';
        const segundoNombre = informacionPersonal.segundoNombre || '';
        const primerApellido = informacionPersonal.primerApellido || '';
        const segundoApellido = informacionPersonal.segundoApellido || '';
        const especialidad = informacionLaboral.especialidad || '';

        const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
        return especialidad ? `${nombreCompleto} - ${especialidad}` : nombreCompleto;
      }
      return `Doctor ID: ${medico.id}`;
    } catch (error) {
      console.error('Error getting doctor name:', error);
      return `Doctor ID: ${medico.id}`;
    }
  };

  // Función para obtener información detallada de la cita
  const getAppointmentInfo = (appointment) => {
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
          'NO SE PRESENTÓ': 'NO_SE_PRESENTE'
        };

        estado = estadoMapping[estado] || estado;

        // Extraer especialidad del CUPS (tiene prioridad) o del médico asignado
        let especialidad = 'N/A';
        if (informacionCups && informacionCups.especialidad) {
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
  };

  // Función para obtener información del paciente de la cita
  const getAppointmentPatientInfo = async (appointment) => {
    if (!appointment.pacienteId) {
      return {
        nombre: 'N/A',
        telefono: 'N/A',
        documento: 'N/A',
        estado: 'N/A'
      };
    }

    try {
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
  };

  // Handlers para modales
  const handleAppointmentCreated = async () => {
    // Refresh appointment data for all doctors and date
    if (selectedDate) {
      await loadAllDoctorsData(selectedDate);
    }
  };

  const handleViewAppointmentDetail = async (appointment) => {
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
  };

  const handleCloseAppointmentDetailModal = () => {
    setIsAppointmentDetailModalOpen(false);
    setSelectedAppointmentForDetail(null);
    setAppointmentDetailPatientInfo(null);
    setLoadingAppointmentDetailPatient(false);
  };

  const handleHistoriaClinicaCreated = async (historiaClinica) => {
    console.log('Historia clínica creada:', historiaClinica);

    // La actualización del estado de la cita ya se hace en el modal
    // No es necesario hacerlo aquí nuevamente

    // La historia clínica ya incluye los datos de la primera consulta
    // No es necesario abrir el modal de consulta médica
    setIsHistoriaModalOpen(false);
    setCurrentAppointment(null);
    setHistoriaClinicaId(null);
  };

  const handleConsultaMedicaCreated = async (consulta) => {
    console.log('Consulta médica creada:', consulta);

    // La cita ya debería estar marcada como ATENDIDO desde la creación de la historia clínica
    // Pero por si acaso el flujo es diferente (consulta sin historia nueva), actualizamos el estado
    if (currentAppointment) {
      await updateAppointmentStatus(currentAppointment.id, 'ATENDIDO');
    }

    // Cerrar modales y resetear estado
    setIsConsultaModalOpen(false);
    setCurrentAppointment(null);
    setHistoriaClinicaId(null);
  };

  const handleCloseHistoriaModal = () => {
    setIsHistoriaModalOpen(false);
    setCurrentAppointment(null);
    setHistoriaClinicaId(null);
  };

  const handleCloseConsultaModal = () => {
    setIsConsultaModalOpen(false);
    setCurrentAppointment(null);
    setHistoriaClinicaId(null);
  };

  return {
    // Estados
    selectedDate,
    setSelectedDate,
    medicos,
    allDoctorAppointments,
    loadingMedicos,
    loadingAppointments,
    updatingStatus,
    isAppointmentModalOpen,
    setIsAppointmentModalOpen,
    selectedPatientForAppointment,
    setSelectedPatientForAppointment,
    selectedSlotForAppointment,
    setSelectedSlotForAppointment,
    isAppointmentDetailModalOpen,
    selectedAppointmentForDetail,
    appointmentDetailPatientInfo,
    loadingAppointmentDetailPatient,
    currentAppointment,
    isHistoriaModalOpen,
    isConsultaModalOpen,
    historiaClinicaId,

    // Funciones
    getAvailableStatusTransitions,
    getStatusLabel,
    updateAppointmentStatus,
    handleAtendidoClick,
    loadMedicos,
    loadAllDoctorsData,
    getNombreCompletoMedico,
    getAppointmentInfo,
    getAppointmentPatientInfo,
    handleAppointmentCreated,
    handleViewAppointmentDetail,
    handleCloseAppointmentDetailModal,
    handleHistoriaClinicaCreated,
    handleConsultaMedicaCreated,
    handleCloseHistoriaModal,
    handleCloseConsultaModal,
    refreshCalendarData
  };
};