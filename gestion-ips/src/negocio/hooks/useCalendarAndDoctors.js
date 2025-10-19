import { useState, useEffect, useCallback } from 'react';
import { empleadosApiService } from '../../data/services/empleadosApiService';

/**
 * Custom Hook para manejar la lógica del calendario y médicos
 * @returns {Object} Estados y funciones para manejar calendario y médicos
 */
export const useCalendarAndDoctors = () => {
  // Estados para calendario
  const [selectedDate, setSelectedDate] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [allDoctorAppointments, setAllDoctorAppointments] = useState({});
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  /**
   * Carga la lista de médicos
   */
  const loadMedicos = useCallback(async () => {
    try {
      setLoadingMedicos(true);
      const response = await empleadosApiService.getEmpleados({ size: 1000 });

      if (response && response.content) {
        // Filter employees that are medical doctors
        let medicosFiltrados = response.content.filter(empleado => {
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
      }
    } catch (error) {
      console.error('Error loading medicos:', error);
      setMedicos([]);
    } finally {
      setLoadingMedicos(false);
    }
  }, []);

  /**
   * Obtiene el nombre completo de un médico
   */
  const getNombreCompletoMedico = useCallback((medico) => {
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
  }, []);

  /**
   * Calcula los slots disponibles considerando la duración de las citas
   */
  const calculateAvailableSlots = useCallback((appointments, selectedDate) => {
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
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
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
  }, []);

  // Load médicos on mount
  useEffect(() => {
    loadMedicos();
  }, [loadMedicos]);

  // Set today's date and load appointments when medicos are loaded
  useEffect(() => {
    if (medicos.length > 0) {
      const today = new Date();
      setSelectedDate(today);
      // Load appointments directly without using the callback
      const loadAppointmentsForToday = async () => {
        try {
          setLoadingAppointments(true);

          // Load all appointments
          const { pacientesApiService } = await import('../../data/services/pacientesApiService');
          const appointmentsResponse = await pacientesApiService.getCitas({ size: 1000 });
          const allAppointments = appointmentsResponse.content || [];

          // Filter by date if specified
          let filteredAppointments = allAppointments;
          if (today) {
            // Create date range for the selected day (start to end of day)
            const selectedDateStart = new Date(today);
            selectedDateStart.setHours(0, 0, 0, 0);

            const selectedDateEnd = new Date(today);
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
          const doctorMap = {};
          medicos.forEach(medico => {
            const doctorName = getNombreCompletoMedico(medico);
            doctorMap[doctorName] = medico;
          });

          // Initialize grouped appointments for all doctors
          const groupedAppointments = {};
          medicos.forEach(medico => {
            const doctorName = getNombreCompletoMedico(medico);
            groupedAppointments[medico.id] = {
              doctor: medico,
              doctorName: doctorName,
              appointments: []
            };
          });

          // Group appointments by doctor
          console.log('Processing appointments for date:', today);
          filteredAppointments.forEach(appointment => {
            try {
              const appointmentData = JSON.parse(appointment.datosJson || '{}');
              const medicoAsignado = appointmentData.medicoAsignado;
              console.log('Processing appointment:', appointment.id, 'assigned to:', medicoAsignado);

              if (medicoAsignado && doctorMap[medicoAsignado]) {
                const doctor = doctorMap[medicoAsignado];
                const doctorId = doctor.id;
                console.log('Doctor found for appointment:', doctorId);

                // Get patient name
                let patientName = appointmentData.motivo || 'Paciente';
                if (appointment.pacienteId) {
                  const patientData = patientsData.find(p => p.id == appointment.pacienteId);
                  if (patientData) {
                    console.log('Found patient data for appointment', appointment.id, ':', patientData);
                    try {
                      const datosCompletos = JSON.parse(patientData.datosJson || '{}');
                      console.log('Parsed patient datosCompletos:', datosCompletos);

                      let personalInfo = {};

                      // Handle different data structures
                      console.log('Checking data structures...');
                      console.log('datosCompletos.informacionPersonalJson exists:', !!datosCompletos.informacionPersonalJson);
                      console.log('datosCompletos.informacionPersonal exists:', !!datosCompletos.informacionPersonal);
                      console.log('datosCompletos.datosJson type:', typeof datosCompletos.datosJson);
                      console.log('datosCompletos.datosJson value:', datosCompletos.datosJson);

                      if (datosCompletos.informacionPersonalJson) {
                        // Old structure: informacionPersonalJson as string
                        personalInfo = JSON.parse(datosCompletos.informacionPersonalJson || '{}');
                        console.log('Using old structure - parsed informacionPersonalJson:', personalInfo);
                      } else if (datosCompletos.informacionPersonal) {
                        // New structure: informacionPersonal as object
                        personalInfo = datosCompletos.informacionPersonal;
                        console.log('Using new structure - direct informacionPersonal:', personalInfo);
                      } else if (typeof datosCompletos.datosJson === 'string') {
                        // Double nested structure: datosJson is a string that contains another JSON
                        console.log('Attempting double nested structure...');
                        try {
                          const doubleNestedData = JSON.parse(datosCompletos.datosJson);
                          console.log('Double nested parsed successfully:', doubleNestedData);
                          console.log('Double nested has informacionPersonal:', !!doubleNestedData.informacionPersonal);
                          if (doubleNestedData.informacionPersonal) {
                            personalInfo = doubleNestedData.informacionPersonal;
                            console.log('Found informacionPersonal in double nested structure:', personalInfo);
                          } else {
                            console.log('No informacionPersonal found in double nested structure');
                            console.log('Available keys in double nested:', Object.keys(doubleNestedData));
                            // Check if it's nested under another key
                            if (doubleNestedData.datosJson) {
                              console.log('Found datosJson inside double nested, attempting triple nesting...');
                              try {
                                const tripleNestedData = JSON.parse(doubleNestedData.datosJson);
                                console.log('Triple nested parsed:', tripleNestedData);
                                if (tripleNestedData.informacionPersonal) {
                                  personalInfo = tripleNestedData.informacionPersonal;
                                  console.log('Found informacionPersonal in triple nested structure:', personalInfo);
                                }
                              } catch (error) {
                                console.log('Error parsing triple nested datosJson:', error);
                              }
                            }
                          }
                        } catch (error) {
                          console.log('Error parsing double nested datosJson:', error);
                        }
                      } else if (datosCompletos.datosJson) {
                        // Nested structure: datosJson contains the actual data
                        console.log('Attempting single nested structure...');
                        const nestedData = JSON.parse(datosCompletos.datosJson || '{}');
                        console.log('Single nested parsed:', nestedData);
                        if (nestedData.informacionPersonal) {
                          personalInfo = nestedData.informacionPersonal;
                          console.log('Found informacionPersonal in nested structure:', personalInfo);
                        } else {
                          console.log('No informacionPersonal found in nested structure');
                        }
                      } else {
                        console.log('No informacionPersonal, informacionPersonalJson, or datosJson found');
                        console.log('Available keys in datosCompletos:', Object.keys(datosCompletos));
                      }

                      const fullName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim();
                      console.log('Constructed fullName:', fullName);
                      if (fullName && fullName !== ' ') {
                        patientName = fullName;
                        console.log('Using patient name:', patientName);
                      } else {
                        console.log('FullName is empty or whitespace, keeping motivo:', appointmentData.motivo);
                      }
                    } catch (error) {
                      console.error('Error parsing patient name for appointment:', appointment.id, error);
                    }
                  } else {
                    console.log('No patient data found for pacienteId:', appointment.pacienteId);
                  }
                } else {
                  console.log('No pacienteId found in appointment:', appointment.id);
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

          setAllDoctorAppointments(groupedAppointments);

        } catch (error) {
          console.error('Error loading all doctors data:', error);
          setAllDoctorAppointments({});
        } finally {
          setLoadingAppointments(false);
        }
      };

      loadAppointmentsForToday();
    }
  }, [medicos, getNombreCompletoMedico]);

  /**
   * Obtiene las iniciales del nombre del médico
   */
  const getDoctorInitials = useCallback((doctorName) => {
    if (!doctorName) return '??';
    const parts = doctorName.split(' ');
    const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || '?';
    const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase() || '?';
    return `${firstInitial}${lastInitial}`;
  }, []);

  /**
   * Carga todas las citas de los médicos para una fecha específica
   */
  const loadAllDoctorsData = useCallback(async (date) => {
    if (!date) return;

    try {
      setLoadingAppointments(true);

      // Load all appointments
      const { pacientesApiService } = await import('../../data/services/pacientesApiService');
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
      const doctorMap = {};
      medicos.forEach(medico => {
        const doctorName = getNombreCompletoMedico(medico);
        doctorMap[doctorName] = medico;
      });

      // Initialize grouped appointments for all doctors
      const groupedAppointments = {};
      medicos.forEach(medico => {
        const doctorName = getNombreCompletoMedico(medico);
        groupedAppointments[medico.id] = {
          doctor: medico,
          doctorName: doctorName,
          appointments: []
        };
      });

      // Group appointments by doctor
      console.log('Processing appointments for date:', selectedDate);
      filteredAppointments.forEach(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const medicoAsignado = appointmentData.medicoAsignado;
          console.log('Processing appointment:', appointment.id, 'assigned to:', medicoAsignado);

          if (medicoAsignado && doctorMap[medicoAsignado]) {
            const doctor = doctorMap[medicoAsignado];
            const doctorId = doctor.id;
            console.log('Doctor found for appointment:', doctorId);

            // Get patient name
            let patientName = appointmentData.motivo || 'Paciente';
            if (appointment.pacienteId) {
              const patientData = patientsData.find(p => p.id == appointment.pacienteId);
              if (patientData) {
                console.log('Found patient data for appointment', appointment.id, ':', patientData);
                try {
                  const datosCompletos = JSON.parse(patientData.datosJson || '{}');
                  console.log('Parsed patient datosCompletos:', datosCompletos);

                  let personalInfo = {};

                  // Handle different data structures
                  if (datosCompletos.informacionPersonalJson) {
                    // Old structure: informacionPersonalJson as string
                    personalInfo = JSON.parse(datosCompletos.informacionPersonalJson || '{}');
                    console.log('Using old structure - parsed informacionPersonalJson:', personalInfo);
                  } else if (datosCompletos.informacionPersonal) {
                    // New structure: informacionPersonal as object
                    personalInfo = datosCompletos.informacionPersonal;
                    console.log('Using new structure - direct informacionPersonal:', personalInfo);
                  } else {
                    console.log('No informacionPersonal or informacionPersonalJson found');
                  }

                  const fullName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim();
                  console.log('Constructed fullName:', fullName);
                  if (fullName && fullName !== ' ') {
                    patientName = fullName;
                    console.log('Using patient name:', patientName);
                  } else {
                    console.log('FullName is empty or whitespace, keeping motivo:', appointmentData.motivo);
                  }
                } catch (error) {
                  console.error('Error parsing patient name for appointment:', appointment.id, error);
                }
              } else {
                console.log('No patient data found for pacienteId:', appointment.pacienteId);
              }
            } else {
              console.log('No pacienteId found in appointment:', appointment.id);
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

      setAllDoctorAppointments(groupedAppointments);

    } catch (error) {
      console.error('Error loading all doctors data:', error);
      setAllDoctorAppointments({});
    } finally {
      setLoadingAppointments(false);
    }
  }, [medicos, getNombreCompletoMedico]);

  return {
    // Estados
    selectedDate,
    medicos,
    allDoctorAppointments,
    loadingMedicos,
    loadingAppointments,

    // Setters
    setSelectedDate,
    setAllDoctorAppointments,
    setLoadingAppointments,

    // Funciones
    loadMedicos,
    loadAllDoctorsData,
    getNombreCompletoMedico,
    getDoctorInitials,
    calculateAvailableSlots
  };
};
