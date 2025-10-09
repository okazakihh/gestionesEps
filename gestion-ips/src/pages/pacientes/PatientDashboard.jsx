import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ActionIcon, Group } from '@mantine/core';
import Swal from 'sweetalert2';
import PatientList from '../../components/pacientes/PatientDashboard/PatientList.jsx';
import PatientDetailModal from '../../components/pacientes/PatientDashboard/PatientDetailModal.jsx';
import CreatePatientModal from '../../components/pacientes/PatientDashboard/CreatePatientModal.jsx';
import PatientSearchModal from '../../components/pacientes/PatientDashboard/PatientSearchModal.jsx';
import AgendaModal from '../../components/pacientes/PatientDashboard/AgendaModal.jsx';
import ScheduleAppointmentModal from '../../components/pacientes/PatientDashboard/ScheduleAppointmentModal.jsx';
import CalendarWidget from '../../components/pacientes/PatientDashboard/CalendarWidget.jsx';
import { empleadosApiService } from '../../services/empleadosApiService.js';
import { pacientesApiService, consultasApiService } from '../../services/pacientesApiService.js';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [prefillDocumentNumber, setPrefillDocumentNumber] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState(null);
  const [selectedSlotForAppointment, setSelectedSlotForAppointment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState(null);
  const [appointmentDetailPatientInfo, setAppointmentDetailPatientInfo] = useState(null);
  const [loadingAppointmentDetailPatient, setLoadingAppointmentDetailPatient] = useState(false);

  // Estados para el calendario y citas
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Modal handlers
  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  const handleScheduleAppointment = (patientId, patientName) => {
    setSelectedPatientForAppointment({ id: patientId, name: patientName });
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedPatientForAppointment(null);
  };

  const handleSlotClick = (slot) => {
    if (!slot.available) return;

    setSelectedSlotForAppointment({
      ...slot,
      date: selectedDate
    });
    setIsPatientSearchModalOpen(true);
  };

  const handlePatientSelected = (patient, patientName) => {
    setSelectedPatientForAppointment({
      id: patient.id,
      name: patientName,
      slot: selectedSlotForAppointment
    });
    setIsAppointmentModalOpen(true);
  };

  const handleCreatePatient = (documentNumber) => {
    // Close search modal and open create patient modal with document pre-filled
    setIsPatientSearchModalOpen(false);
    setPrefillDocumentNumber(documentNumber);
    setIsCreatePatientModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    // Set editing mode and open create patient modal with patient data
    setEditingPatient(patient);
    setIsCreatePatientModalOpen(true);
  };

  const handleClosePatientSearchModal = () => {
    setIsPatientSearchModalOpen(false);
    setSelectedSlotForAppointment(null);
  };

  const handleAppointmentCreated = () => {
    // Refresh appointment data for the current doctor and date
    if (selectedDoctor) {
      loadDoctorData(selectedDoctor, selectedDate);
    }
    console.log('Cita creada exitosamente - datos actualizados');
  };

  // Funciones para manejar acciones de citas
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO'],
      'EN_SALA': ['ATENDIDO'],
      'ATENDIDO': [],
      'NO_SE_PRESENTO': []
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó'
    };
    return labels[status] || status;
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

      const response = await pacientesApiService.actualizarEstadoCita(appointmentId, newStatus);

      // Update the appointment in the local state
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId ? {
            ...appointment,
            status: newStatus // Ensure status is updated
          } : appointment
        )
      );

      // Show success message with SweetAlert2
      const statusLabels = {
        'EN_SALA': 'En Sala',
        'ATENDIDO': 'Atendido',
        'NO_SE_PRESENTO': 'No se Presentó'
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

  const handleAtendidoClick = async (appointment) => {
    // For now, just update the status directly
    // Later we can implement the full flow of checking for historia clinica and creating consulta
    await updateAppointmentStatus(appointment.id, 'ATENDIDO');
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
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
          // ISO format with time: "2024-12-15T10:30:00.000+00:00" or "2024-12-15T10:30"
          date = new Date(dateString);
        } else if (dateString.includes('-') && dateString.length === 10) {
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
          'NO SE PRESENTÓ': 'NO_SE_PRESENTO'
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

  const handleOpenCreatePatientModal = () => {
    setIsCreatePatientModalOpen(true);
  };

  const handleCloseCreatePatientModal = () => {
    setIsCreatePatientModalOpen(false);
    setPrefillDocumentNumber('');
    setEditingPatient(null);
  };

  const handlePatientCreated = async (patientData) => {
    // Refresh patient list
    setRefreshTrigger(prev => prev + 1);
    console.log('Paciente procesado exitosamente - lista actualizada', patientData);

    // Only show appointment creation confirmation for new patients (not when editing)
    if (!editingPatient && selectedSlotForAppointment) {
      const result = await Swal.fire({
        title: '¿Crear cita médica?',
        text: `El paciente ${patientData.nombreCompleto || 'ha sido creado exitosamente'}. ¿Desea agendar una cita médica para este paciente en el horario seleccionado?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, crear cita',
        cancelButtonText: 'No, gracias'
      });

      if (result.isConfirmed) {
        // Create patient name from patient data
        let patientName = 'Paciente';
        try {
          if (patientData.datosJson) {
            const parsedData = JSON.parse(patientData.datosJson);
            if (parsedData.datosJson) {
              const innerData = JSON.parse(parsedData.datosJson);
              const personalInfo = innerData.informacionPersonal || {};
              patientName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim() || `Paciente ${patientData.id}`;
            }
          }
        } catch (error) {
          console.error('Error parsing patient name:', error);
          patientName = `Paciente ${patientData.id}`;
        }

        // Proceed with appointment creation
        setSelectedPatientForAppointment({
          id: patientData.id,
          name: patientName,
          slot: selectedSlotForAppointment
        });
        setIsAppointmentModalOpen(true);
      } else {
        // Clear the selected slot since they don't want to create appointment
        setSelectedSlotForAppointment(null);
      }
    }

    // Clear editing state after processing
    setEditingPatient(null);
  };

  const handleOpenAgendaModal = () => {
    setIsAgendaModalOpen(true);
  };

  const handleCloseAgendaModal = () => {
    setIsAgendaModalOpen(false);
  };

  // Función para calcular horas disponibles considerando duración
  const calculateAvailableSlots = (appointments, selectedDate) => {
    const slots = [];

    // Generar slots cada 20 minutos de 6:00 AM a 8:00 PM
    const startHour = 6; // 6:00 AM
    const endHour = 20; // 8:00 PM
    const intervalMinutes = 20;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        // Para la última hora (8:00 PM), solo incluir si es exactamente 8:00
        if (hour === endHour && minute > 0) break;

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;

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
  };

  // Funciones para el calendario y citas
  const loadMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const response = await empleadosApiService.getEmpleados({ size: 1000 });
      const empleados = response.content || [];

      // Filter employees that are medical doctors
      const medicosFiltrados = empleados.filter(empleado => {
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

  const loadDoctorData = async (doctorId, date) => {
    if (!doctorId) return;

    try {
      setLoadingAppointments(true);
      setLoadingPatients(true);

      // Get doctor details for name comparison
      const selectedDoctor = medicos.find(m => m.id == doctorId);
      const doctorName = selectedDoctor ? getNombreCompletoMedico(selectedDoctor) : '';

      // Load all appointments
      const appointmentsResponse = await pacientesApiService.getCitas({ size: 1000 });
      const allAppointments = appointmentsResponse.content || [];

      // Filter appointments by doctor using the medicoAsignado field from datosJson
      let filteredAppointments = allAppointments.filter(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const medicoAsignado = appointmentData.medicoAsignado;
          return medicoAsignado && medicoAsignado === doctorName;
        } catch (error) {
          console.error('Error parsing appointment doctor:', appointment.id, error);
          return false;
        }
      });

      // Filter by date if specified
      if (date) {
        const selectedDateString = date.toISOString().split('T')[0];
        filteredAppointments = filteredAppointments.filter(appointment => {
          try {
            const appointmentData = JSON.parse(appointment.datosJson || '{}');
            const appointmentDateTime = appointmentData.fechaHoraCita;
            if (!appointmentDateTime) return false;

            const appointmentDate = new Date(appointmentDateTime).toISOString().split('T')[0];
            return appointmentDate === selectedDateString;
          } catch (error) {
            console.error('Error parsing appointment date:', error);
            return false;
          }
        });
      } else {
        // If no date selected, show only future appointments (next 30 days)
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        filteredAppointments = filteredAppointments.filter(appointment => {
          try {
            const appointmentData = JSON.parse(appointment.datosJson || '{}');
            const appointmentDateTime = appointmentData.fechaHoraCita;
            if (!appointmentDateTime) return false;

            const appointmentDate = new Date(appointmentDateTime);
            return appointmentDate >= today && appointmentDate <= thirtyDaysFromNow;
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
      setDoctorPatients(patientsData);

      // Transform appointments to display format with patient names
      const formattedAppointments = filteredAppointments.map(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const appointmentDateTime = new Date(appointmentData.fechaHoraCita);

          // Get patient name from loaded patient data
          let patientName = appointmentData.motivo || 'Paciente'; // Default to motivo
          if (appointment.pacienteId) {
            const patientData = patientsData.find(p => p.id == appointment.pacienteId);
            if (patientData) {
              try {
                // Parse the datosJson field which contains the patient information
                const datosCompletos = JSON.parse(patientData.datosJson || '{}');

                // Parse the informacionPersonalJson field within datosJson
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

          return {
            id: appointment.id,
            time: appointmentDateTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            patient: patientName,
            status: appointmentData.estado || 'PROGRAMADA',
            pacienteId: appointment.pacienteId,
            // Include complete appointment data for detail modal
            datosJson: appointment.datosJson,
            fechaCreacion: appointment.fechaCreacion
          };
        } catch (error) {
          console.error('Error formatting appointment:', appointment.id, error);
          return {
            id: appointment.id,
            time: 'N/A',
            patient: 'Error al cargar',
            status: 'ERROR',
            pacienteId: null
          };
        }
      });
      setAppointments(formattedAppointments);

    } catch (error) {
      console.error('Error loading doctor data:', error);
      setAppointments([]);
      setDoctorPatients([]);
    } finally {
      setLoadingAppointments(false);
      setLoadingPatients(false);
    }
  };
  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setAppointments([]);
    setDoctorPatients([]);
    if (doctorId) {
      loadDoctorData(doctorId, selectedDate);
    }
  };

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

  // Load doctors on component mount
  useEffect(() => {
    loadMedicos();
  }, []);



  return (
    <MainLayout title="Dashboard de Pacientes" subtitle="Gestión integral del flujo médico de pacientes">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Pacientes</h1>
              <p className="mt-2 text-lg text-gray-600">
                Dashboard unificado para el seguimiento completo del flujo médico
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleOpenCreatePatientModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Calendar */}
            <CalendarWidget
              onDaySelect={(date) => {
                setSelectedDate(date);
                // Reload doctor data if doctor is already selected
                if (selectedDoctor) {
                  loadDoctorData(selectedDoctor, date);
                }
              }}
              onNewPatient={handleOpenCreatePatientModal}
              onOpenAgenda={handleOpenAgendaModal}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appointment Availability Card */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
                </h3>

                {/* Doctor Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Seleccionar Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingMedicos}
                  >
                    <option value="">
                      {loadingMedicos ? 'Cargando doctores...' : 'Seleccionar doctor'}
                    </option>
                    {medicos.map((medico) => (
                      <option key={medico.id} value={medico.id}>
                        {getNombreCompletoMedico(medico)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule and Appointments */}
                {selectedDoctor && (
                  <div className="space-y-6">
                    {/* Time slots */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Horarios Disponibles</h4>

                      {loadingAppointments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando horarios...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
                          {calculateAvailableSlots(appointments, selectedDate).map((slot) => (
                            <div
                              key={slot.time}
                              onClick={() => slot.available && handleSlotClick(slot)}
                              className={`p-1 text-center text-xs rounded border transition-colors ${
                                slot.available
                                  ? 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-sm'
                                  : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                              }`}
                              title={slot.available ? 'Click para agendar cita' : 'Horario ocupado'}
                            >
                              {slot.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Appointments for selected date or upcoming */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {selectedDate
                          ? `Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
                          : 'Próximas Citas Programadas'
                        }
                      </h4>

                      {loadingAppointments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando citas...</p>
                        </div>
                      ) : appointments.length > 0 ? (
                        <div className="space-y-2">
                          {appointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <div>
                                  <span className="text-sm font-medium">{appointment.time} - {appointment.patient}</span>
                                  <p className="text-xs text-gray-600">
                                    {(() => {
                                      try {
                                        const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                        return appointmentData.motivo || 'REVISION PERIODICA';
                                      } catch (error) {
                                        return 'REVISION PERIODICA';
                                      }
                                    })()}
                                    {(() => {
                                      try {
                                        const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                        const duracion = appointmentData.duracion || 30;
                                        return ` (${duracion} min)`;
                                      } catch (error) {
                                        return ' (30 min)';
                                      }
                                    })()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  appointment.status === 'CONFIRMADA' || appointment.status === 'PROGRAMADO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : appointment.status === 'EN_SALA'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : appointment.status === 'ATENDIDO'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {appointment.status === 'PROGRAMADO' ? 'Programado' :
                                   appointment.status === 'EN_SALA' ? 'En Sala' :
                                   appointment.status === 'ATENDIDO' ? 'Atendido' :
                                   appointment.status === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                   appointment.status}
                                </span>
                                <Group gap="xs">
                                  <ActionIcon
                                    variant="light"
                                    color="gray"
                                    size="sm"
                                    onClick={() => handlePatientClick(appointment.pacienteId)}
                                    title="Ver paciente"
                                  >
                                    <UserIcon className="w-4 h-4" />
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    onClick={() => handleViewAppointmentDetail(appointment)}
                                    title="Detalle de la cita"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </ActionIcon>
                                  {/* Status Change Buttons */}
                                  {getAvailableStatusTransitions(appointment.status).map((newStatus) => (
                                    <ActionIcon
                                      key={newStatus}
                                      variant="light"
                                      color={
                                        newStatus === 'EN_SALA' ? 'yellow' :
                                        newStatus === 'ATENDIDO' ? 'green' :
                                        newStatus === 'NO_SE_PRESENTO' ? 'red' : 'blue'
                                      }
                                      size="sm"
                                      onClick={() => {
                                        if (newStatus === 'ATENDIDO') {
                                          handleAtendidoClick(appointment);
                                        } else {
                                          updateAppointmentStatus(appointment.id, newStatus);
                                        }
                                      }}
                                      disabled={updatingStatus[appointment.id]}
                                      title={getStatusLabel(newStatus)}
                                      loading={updatingStatus[appointment.id]}
                                    >
                                      {newStatus === 'EN_SALA' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {newStatus === 'ATENDIDO' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {newStatus === 'NO_SE_PRESENTO' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                    </ActionIcon>
                                  ))}
                                </Group>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {selectedDate ? 'No hay citas programadas para este día' : 'No hay citas programadas próximamente'}
                        </p>
                      )}
                    </div>

                    {/* Patients associated with this doctor */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Pacientes del Doctor</h4>

                      {loadingPatients ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando pacientes...</p>
                        </div>
                      ) : doctorPatients.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {doctorPatients.map((patient) => {
                            try {
                              // Parse the datosJson field which contains the patient information
                              const datosCompletos = JSON.parse(patient.datosJson || '{}');

                              // Parse the informacionPersonalJson and informacionContactoJson fields within datosJson
                              const infoPersonal = JSON.parse(datosCompletos.informacionPersonalJson || '{}');
                              const infoContacto = JSON.parse(datosCompletos.informacionContactoJson || '{}');

                              const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

                              return (
                                <div key={patient.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <div className="flex items-center space-x-3">
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <span className="text-sm font-medium text-blue-900">{nombreCompleto || `Paciente ${patient.id}`}</span>
                                      <p className="text-xs text-blue-700">{infoContacto.telefono || 'Sin teléfono'}</p>
                                    </div>
                                  </div>
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    ID: {patient.id}
                                  </span>
                                </div>
                              );
                            } catch (error) {
                              console.error('❌ Error parsing patient data:', patient.id, error);
                              return (
                                <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                                  <div className="flex items-center space-x-3">
                                    <UserIcon className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-900">Error al cargar paciente {patient.id}</span>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No hay pacientes asociados a este doctor</p>
                      )}
                    </div>
                  </div>
                )}

                {!selectedDoctor && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Selecciona un doctor para ver su agenda, citas y pacientes</p>
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Selecciona un día</h3>
                  <p className="text-xs text-gray-500">Haz click en un día del calendario para ver la disponibilidad de citas</p>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar pacientes por nombre, documento o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">EPS</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Todas</option>
                        <option value="nueva_eps">Nueva EPS</option>
                        <option value="salud_total">Salud Total</option>
                        <option value="sanitas">Sanitas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Todos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient List */}
            <div className="bg-white shadow rounded-lg">
              <PatientList
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onPatientClick={handlePatientClick}
                onScheduleAppointment={handleScheduleAppointment}
                onEditPatient={handleEditPatient}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Patient Detail Modal */}
        <PatientDetailModal
          patientId={selectedPatientId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Create Patient Modal */}
        <CreatePatientModal
          isOpen={isCreatePatientModalOpen}
          onClose={handleCloseCreatePatientModal}
          onPatientCreated={handlePatientCreated}
          prefillDocumentNumber={prefillDocumentNumber}
          editingPatient={editingPatient}
        />

        {/* Patient Search Modal */}
        <PatientSearchModal
          isOpen={isPatientSearchModalOpen}
          onClose={handleClosePatientSearchModal}
          onPatientSelected={handlePatientSelected}
          onCreatePatient={handleCreatePatient}
          selectedSlot={selectedSlotForAppointment}
          selectedDoctor={selectedDoctor ? getNombreCompletoMedico(medicos.find(m => m.id == selectedDoctor)) : null}
        />

        {/* Agenda Modal */}
        <AgendaModal
          isOpen={isAgendaModalOpen}
          onClose={handleCloseAgendaModal}
        />

        {/* Schedule Appointment Modal */}
        <ScheduleAppointmentModal
          patientId={selectedPatientForAppointment?.id}
          patientName={selectedPatientForAppointment?.name}
          selectedSlot={selectedPatientForAppointment?.slot}
          selectedDoctor={selectedDoctor ? getNombreCompletoMedico(medicos.find(m => m.id == selectedDoctor)) : null}
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onAppointmentCreated={handleAppointmentCreated}
        />

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Dashboard Unificado de Pacientes
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Este dashboard proporciona una vista completa del flujo médico de cada paciente.
                  Desde el registro inicial hasta el seguimiento continuo, todo el historial médico
                  está disponible en una interfaz intuitiva y fácil de navegar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Cita */}
      {isAppointmentDetailModalOpen && selectedAppointmentForDetail && (() => {
        const appointmentInfo = getAppointmentInfo(selectedAppointmentForDetail);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseAppointmentDetailModal}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Detalle de la Cita #{selectedAppointmentForDetail.id}
                  </h3>
                  <button
                    onClick={handleCloseAppointmentDetailModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Estado y Fecha */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          appointmentInfo.estado === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                          appointmentInfo.estado === 'EN_SALA' ? 'bg-yellow-100 text-yellow-800' :
                          appointmentInfo.estado === 'ATENDIDO' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointmentInfo.estado === 'PROGRAMADO' ? 'Programado' :
                           appointmentInfo.estado === 'EN_SALA' ? 'En Sala' :
                           appointmentInfo.estado === 'ATENDIDO' ? 'Atendido' :
                           appointmentInfo.estado === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                           appointmentInfo.estado}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{appointmentInfo.fechaHoraCita ? formatDate(appointmentInfo.fechaHoraCita) : 'Fecha no disponible'}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creada: {formatDate(selectedAppointmentForDetail.fechaCreacion)}
                      </div>
                    </div>

                    {/* Información del Paciente */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                        Información del Paciente
                      </h4>
                      {loadingAppointmentDetailPatient ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Cargando información del paciente...</span>
                        </div>
                      ) : appointmentDetailPatientInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Nombre Completo</p>
                            <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.nombre}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Documento</p>
                            <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.documento}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Teléfono</p>
                            <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.telefono}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Estado</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              appointmentDetailPatientInfo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {appointmentDetailPatientInfo.estado}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No se pudo cargar la información del paciente</p>
                      )}
                    </div>

                    {/* Información de la Cita */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Información de la Cita
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Especialidad</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.especialidad}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Médico Asignado</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.medicoAsignado}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Tipo de Cita</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.tipoCita}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Motivo</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.motivo}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Duración</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.duracion} minutos</p>
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      {appointmentInfo.notas && appointmentInfo.notas !== 'Sin notas' && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">Notas Adicionales</p>
                          <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">{appointmentInfo.notas}</p>
                        </div>
                      )}
                    </div>

                    {/* Información CUPS */}
                    {appointmentInfo.codigoCups && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Código CUPS
                        </h4>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-green-900">Código:</span>
                          <span className="ml-2 text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">{appointmentInfo.codigoCups}</span>
                        </div>
                        {appointmentInfo.informacionCups && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {appointmentInfo.informacionCups.categoria && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Categoría:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.categoria}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.tipo && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Tipo:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.tipo}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.ambito && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Ámbito:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.ambito}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.equipo_requerido && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Equipo Requerido:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.equipo_requerido}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Acciones disponibles */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Acciones Disponibles</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableStatusTransitions(appointmentInfo.estado).map((newStatus) => (
                          <button
                            key={newStatus}
                            onClick={() => {
                              updateAppointmentStatus(selectedAppointmentForDetail.id, newStatus);
                              handleCloseAppointmentDetailModal();
                            }}
                            disabled={updatingStatus[selectedAppointmentForDetail.id]}
                            className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white transition-colors duration-200 ${
                              newStatus === 'EN_SALA'
                                ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                : newStatus === 'ATENDIDO'
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : newStatus === 'NO_SE_PRESENTO'
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updatingStatus[selectedAppointmentForDetail.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : null}
                            {newStatus === 'PROGRAMADO' ? 'Programado' :
                             newStatus === 'EN_SALA' ? 'En Sala' :
                             newStatus === 'ATENDIDO' ? 'Atendido' :
                             newStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                             newStatus}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCloseAppointmentDetailModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </MainLayout>
  );
};

export default PatientDashboard;