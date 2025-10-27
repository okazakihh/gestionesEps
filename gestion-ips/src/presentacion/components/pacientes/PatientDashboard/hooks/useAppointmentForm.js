import { useState, useEffect } from 'react';

/**
 * Hook para manejar el estado y lógica del formulario de citas
 * Gestiona el estado del formulario, validaciones y efectos
 */
export const useAppointmentForm = (selectedSlot, selectedDoctor, medicos, getNombreCompletoMedico) => {
  const [formData, setFormData] = useState({
    fechaHoraCita: '',
    motivo: '',
    medicoAsignado: '',
    medicoId: '',
    estado: 'PROGRAMADA',
    notas: '',
    codigoCups: '',
    duracion: '30' // Duración por defecto en minutos
  });

  const [errors, setErrors] = useState({});
  const [selectedCupData, setSelectedCupData] = useState(null);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-fill fields based on CUPS code selection
    if (field === 'codigoCups' && value) {
      handleCupsSelection(value);
    }

    // Handle doctor selection - store both name and ID
    if (field === 'medicoAsignado' && value) {
      handleDoctorSelection(value);
    }
  };

  // Handle CUPS code selection with auto-fill logic
  const handleCupsSelection = (cupsCode) => {
    // This will be called from the parent component with codigosCups data
    // For now, just clear the selected data
    setSelectedCupData(null);
  };

  // Handle doctor selection
  const handleDoctorSelection = (doctorName) => {
    if (!medicos.length) return;

    const selectedMedico = medicos.find(medico => getNombreCompletoMedico(medico) === doctorName);
    if (selectedMedico) {
      setFormData(prev => ({
        ...prev,
        medicoAsignado: doctorName,
        medicoId: selectedMedico.id
      }));
      return; // Exit early to avoid the default setFormData
    }
  };

  // Pre-fill date and time when slot changes
  useEffect(() => {
    if (selectedSlot) {
      // Create date in local timezone to avoid timezone issues
      const year = selectedSlot.date.getFullYear();
      const month = selectedSlot.date.getMonth();
      const day = selectedSlot.date.getDate();
      const [hours, minutes] = selectedSlot.time.split(':').map(Number);

      const slotDateTime = new Date(year, month, day, hours, minutes);
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const formattedDateTime = slotDateTime.getFullYear() + '-' +
        String(slotDateTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(slotDateTime.getDate()).padStart(2, '0') + 'T' +
        String(slotDateTime.getHours()).padStart(2, '0') + ':' +
        String(slotDateTime.getMinutes()).padStart(2, '0');

      setFormData(prev => ({
        ...prev,
        fechaHoraCita: formattedDateTime
      }));
    }
  }, [selectedSlot]);

  // Pre-fill doctor when doctors are loaded and doctor is selected
  useEffect(() => {
    if (selectedDoctor && medicos.length > 0 && getNombreCompletoMedico) {
      // Find the doctor to get the ID
      const doctor = medicos.find(m => getNombreCompletoMedico(m) === selectedDoctor);
      if (doctor) {
        setFormData(prev => ({
          ...prev,
          medicoAsignado: selectedDoctor,
          medicoId: doctor.id
        }));
      }
    }
  }, [selectedDoctor, medicos, getNombreCompletoMedico]);

  // Reset form
  const resetForm = () => {
    setFormData({
      fechaHoraCita: '',
      motivo: '',
      medicoAsignado: '',
      medicoId: '',
      estado: 'PROGRAMADA',
      notas: '',
      codigoCups: '',
      duracion: '30'
    });
    setSelectedCupData(null);
    setErrors({});
  };

  return {
    // Form state
    formData,
    errors,
    selectedCupData,

    // Actions
    handleInputChange,
    resetForm,
    setErrors,
    setSelectedCupData
  };
};