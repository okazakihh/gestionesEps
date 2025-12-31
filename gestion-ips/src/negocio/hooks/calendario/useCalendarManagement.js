// hooks/useCalendarManagement.js
import { useEffect } from 'react';
import { useAuth } from '../../../data/context/AuthContext.jsx';

export const useCalendarManagement = () => {
  const { user } = useAuth();

  // Estados específicos del calendario

  // Función para calcular horas disponibles considerando duración
  const calculateAvailableSlots = (disponibilidades, appointments, selectedDate) => {
    // Si no hay fecha seleccionada, no hay slots disponibles.
    if (!selectedDate || !(selectedDate instanceof Date)) {
      return [];
    }
     const slots = [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    const isToday = selectedDateOnly.getTime() === today.getTime();

    // Si no hay disponibilidades, no hay slots.
    if (!disponibilidades || disponibilidades.length === 0) {
      return [];
    }

    const intervalMinutes = 20;

    disponibilidades.forEach(disponibilidad => {
      const disponibilidadData = JSON.parse(disponibilidad.datosJson || '{}');
      const [startHour, startMinute] = disponibilidadData.horaInicio.split(':').map(Number);
      const [endHour, endMinute] = disponibilidadData.horaFin.split(':').map(Number);

      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          if (hour === startHour && minute < startMinute) continue;
          if (hour === endHour && minute >= endMinute) break;

          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const ampm = hour < 12 ? 'AM' : 'PM';
          const label = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;

          if (isToday) {
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(hour, minute, 0, 0);
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            if (slotDateTime <= oneHourFromNow) {
              continue;
            }
          }

          slots.push({ time: timeString, label: label });
        }
      }
    });

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

  // Función para manejar click en slot
  const handleSlotClick = (slot, doctorId = null, currentDate) => {
    if (!slot.available) return;

    return {
      ...slot,
      date: currentDate,
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

  // Función para verificar si el usuario es doctor
  const isUserDoctor = () => {
    return user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');
  };

  return {
    // Funciones
    calculateAvailableSlots,
    handleSlotClick,
    getDoctorInitials,
    isUserDoctor
  };
};
