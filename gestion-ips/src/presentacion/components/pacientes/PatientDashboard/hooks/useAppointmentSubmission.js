import { useState } from 'react';
import { pacientesApiService } from '../../../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

/**
 * Hook para manejar el envío del formulario de citas
 * Separa la lógica de envío y validación del componente
 */
export const useAppointmentSubmission = (patientId, patientName, onAppointmentCreated, onClose) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Validate form data
  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.fechaHoraCita) {
      newErrors.fechaHoraCita = 'La fecha y hora son obligatorias';
    } else {
      const selectedDate = new Date(formData.fechaHoraCita);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      if (selectedDate <= oneHourFromNow) {
        newErrors.fechaHoraCita = 'La cita debe ser programada al menos 1 hora después de la hora actual';
      }

      // Check if the selected date is in the past (before today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly < today) {
        newErrors.fechaHoraCita = 'No se pueden agendar citas en fechas pasadas';
      }
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo de la consulta es obligatorio';
    }

    if (!formData.medicoAsignado.trim()) {
      newErrors.medicoAsignado = 'El médico asignado es obligatorio';
    }

    if (!formData.codigoCups) {
      newErrors.codigoCups = 'El código CUPS es obligatorio';
    }

    return newErrors;
  };

  // Submit appointment
  const submitAppointment = async (formData, selectedCupData, setFormErrors) => {
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setDebugInfo(null);

    try {
      // Format the appointment data as JSON
      const appointmentData = {
        fechaHoraCita: formData.fechaHoraCita,
        motivo: formData.motivo.trim(),
        medicoAsignado: formData.medicoAsignado.trim(),
        medicoId: formData.medicoId,
        estado: formData.estado,
        notas: formData.notas.trim(),
        codigoCups: formData.codigoCups,
        duracion: parseInt(formData.duracion || '30'),
        // Include complete CUPS information if selected
        ...(selectedCupData && {
          informacionCups: selectedCupData
        })
      };

      const jsonData = JSON.stringify(appointmentData);

      // Store debug info for potential error display
      setDebugInfo({
        url: `POST /api/citas/paciente/${patientId}`,
        requestData: appointmentData,
        jsonData: jsonData
      });

      // Call the API to create the appointment
      const response = await pacientesApiService.createAppointment(patientId, jsonData);

      // Check if response indicates success
      const isSuccess = response && (
        response.success === true ||
        (response.id && response.pacienteId && response.datosJson)
      );

      if (isSuccess) {
        // Success - show SweetAlert and close modal
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Cita agendada!',
            text: `Cita médica agendada exitosamente para ${patientName}`,
            confirmButtonColor: '#10B981',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }, 100);

        // Close modal and notify parent
        onClose();
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }

        return true; // Success
      } else {
        // Handle API error response
        const errorMessage = response?.error || response?.message || 'Error desconocido del servidor';
        throw new Error(`Error del servidor: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Error completo al crear cita:', error);

      // Determine error type and message
      let errorTitle = 'Error al agendar cita';
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos para agendar citas. Contacta al administrador.';
      } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        errorTitle = 'Servicio no disponible';
        errorMessage = 'El servicio de citas no está disponible. Inténtalo más tarde.';
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorTitle = 'Error del servidor';
        errorMessage = 'Error interno del servidor. Los administradores han sido notificados.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Set error state for visual display
      setSubmitError({
        title: errorTitle,
        message: errorMessage
      });

      // Update debug info with error details
      setDebugInfo(prev => prev ? {
        ...prev,
        error: error.message,
        response: error.response || 'No response received'
      } : {
        url: `POST /api/citas/paciente/${patientId}`,
        requestData: formData,
        error: error.message,
        response: error.response || 'No response received'
      });

      // Also show SweetAlert for additional feedback
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });

      return false; // Error
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    submitError,
    debugInfo,

    // Actions
    submitAppointment,
    setSubmitError
  };
};