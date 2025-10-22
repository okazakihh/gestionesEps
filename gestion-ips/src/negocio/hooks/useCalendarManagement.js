// hooks/useCalendarManagement.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../data/context/AuthContext.jsx';
import { useAppointmentManagement } from './useAppointmentManagement.js';

export const useCalendarManagement = () => {
  const { user } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    medicos,
    allDoctorAppointments,
    loadingMedicos,
    loadingAppointments,
    loadMedicos,
    loadAllDoctorsData
  } = useAppointmentManagement();

  // Estados específicos del calendario
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Función para calcular horas disponibles considerando duración
  const calculateAvailableSlots = (appointments, selectedDate) => {
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
  };

  // Función para manejar selección de fecha
  const handleDaySelect = async (date) => {
    setSelectedDate(date);
    // Reload all doctors data for the selected date
    await loadAllDoctorsData(date);
  };

  // Función para manejar click en slot
  const handleSlotClick = (slot, doctorId = null) => {
    if (!slot.available) return;

    return {
      ...slot,
      date: selectedDate,
      doctorId: doctorId
    };
  };

  // Función para obtener iniciales del doctor
  const getDoctorInitials = (doctorName) => {
    if (!doctorName) return '??';
    const parts = doctorName.split(' ');
    const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || '?';
    const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase() || '?';
    return `${firstInitial}${lastInitial}`;
  };

  // Función para filtrar médicos según el rol del usuario
  const getFilteredMedicos = () => {
    if (!user) return medicos;

    // If user is a doctor, filter to show only their own information
    if (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO') {
      console.log('User is a doctor, filtering to show only their info');
      console.log('User documento:', user.documento, 'User ID:', user.id);

      // Find the doctor that matches the current user
      const currentDoctor = medicos.find(medico => {
        try {
          const datosCompletos = JSON.parse(medico.jsonData || '{}');
          const matchByDocumento = datosCompletos.numeroDocumento === user.documento;
          const matchById = medico.id === user.id;
          console.log('Checking doctor:', medico.id, 'documento:', datosCompletos.numeroDocumento, 'matchByDocumento:', matchByDocumento, 'matchById:', matchById);
          return matchByDocumento || matchById;
        } catch (error) {
          console.error('Error checking doctor match:', error);
          return false;
        }
      });

      console.log('Current doctor found:', currentDoctor);

      return currentDoctor ? [currentDoctor] : [];
    }

    return medicos;
  };

  // Función para verificar si el usuario es doctor
  const isUserDoctor = () => {
    return user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');
  };

  // Inicializar datos del calendario
  useEffect(() => {
    const initializeCalendar = async () => {
      setIsCalendarLoading(true);
      try {
        await loadMedicos();
      } finally {
        setIsCalendarLoading(false);
      }
    };

    initializeCalendar();
  }, [user]);

  return {
    // Estados
    selectedDate,
    medicos: getFilteredMedicos(),
    allDoctorAppointments,
    loadingMedicos,
    loadingAppointments,
    isCalendarLoading,

    // Funciones
    calculateAvailableSlots,
    handleDaySelect,
    handleSlotClick,
    getDoctorInitials,
    isUserDoctor
  };
};