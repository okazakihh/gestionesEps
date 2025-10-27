import React, { useState } from 'react';
import { pacientesApiService, codigosCupsApiService } from '../../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../../data/services/empleadosApiService.js';

import Swal from 'sweetalert2';

// Import extracted components
import ScheduleAppointmentHeader from './agendaModal/ScheduleAppointmentHeader.jsx';
import ScheduleAppointmentForm from './agendaModal/ScheduleAppointmentForm.jsx';

const ScheduleAppointmentModal = ({ patientId, patientName, selectedSlot, selectedDoctor, isOpen, onClose, onAppointmentCreated }) => {
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [codigosCups, setCodigosCups] = useState([]);
  const [loadingCodigosCups, setLoadingCodigosCups] = useState(false);
  const [selectedCupData, setSelectedCupData] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);

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
      const selectedCup = codigosCups.find(cup => cup.codigoCup === value);
      if (selectedCup && selectedCup.datosJson) {
        try {
          const cupData = JSON.parse(selectedCup.datosJson);
          setSelectedCupData(cupData); // Store CUPS data for display

          const updatedData = {
            ...formData,
            [field]: value,
            // Only auto-fill doctor if no doctor is selected yet and CUPS has specialty
            ...(cupData.especialidad && !formData.medicoAsignado && {
              medicoAsignado: cupData.especialidad
            })
          };

          setFormData(updatedData);
        } catch (error) {
          console.warn('Error parsing CUPS data:', error);
          setSelectedCupData(null);
        }
      } else {
        setSelectedCupData(null);
      }
    }

    // Handle doctor selection - store both name and ID
    if (field === 'medicoAsignado' && value) {
      const selectedMedico = medicos.find(medico => getNombreCompletoMedico(medico) === value);
      if (selectedMedico) {
        setFormData(prev => ({
          ...prev,
          medicoAsignado: value,
          medicoId: selectedMedico.id
        }));
        return; // Exit early to avoid the default setFormData
      }
    }
  };

  // Load CUPS codes when modal opens
  const loadCodigosCups = async () => {
    try {
      setLoadingCodigosCups(true);
      const response = await codigosCupsApiService.getCodigosCups({ size: 1000 }); // Load all codes
      setCodigosCups(response.content || []);
    } catch (error) {
      console.error('Error loading CUPS codes:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingCodigosCups(false);
    }
  };

  // Load doctors when modal opens
  const loadMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const response = await empleadosApiService.getEmpleados({ size: 1000 }); // Load all employees
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
      // Don't show error to user, just log it
    } finally {
      setLoadingMedicos(false);
    }
  };

  // Get full name of a doctor
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

  // Load CUPS codes and doctors when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadCodigosCups();
      loadMedicos();
    }
  }, [isOpen]);

  // Pre-fill date and time when slot changes
  React.useEffect(() => {
    if (isOpen && selectedSlot) {
      // Create date in local timezone to avoid timezone issues
      const year = selectedSlot.date.getFullYear();
      const month = selectedSlot.date.getMonth();
      const day = selectedSlot.date.getDate();
      const [hours, minutes] = selectedSlot.time.split(':').map(Number);

      console.log('Debugging time:', { selectedSlot, year, month, day, hours, minutes });

      const slotDateTime = new Date(year, month, day, hours, minutes);
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const formattedDateTime = slotDateTime.getFullYear() + '-' +
        String(slotDateTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(slotDateTime.getDate()).padStart(2, '0') + 'T' +
        String(slotDateTime.getHours()).padStart(2, '0') + ':' +
        String(slotDateTime.getMinutes()).padStart(2, '0');

      console.log('Formatted datetime:', formattedDateTime);

      setFormData(prev => ({
        ...prev,
        fechaHoraCita: formattedDateTime
      }));
    }
  }, [isOpen, selectedSlot]);

  // Pre-fill doctor when doctors are loaded and doctor is selected
  React.useEffect(() => {
    if (isOpen && selectedDoctor && medicos.length > 0) {
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
  }, [isOpen, selectedDoctor, medicos]);

  const validateForm = () => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null); // Clear previous errors
    setDebugInfo(null); // Clear previous debug info
    let appointmentCreated = false;

    try {
      // Format the appointment data as JSON
      const appointmentData = {
        fechaHoraCita: formData.fechaHoraCita, // Keep as datetime-local string format
        motivo: formData.motivo.trim(),
        medicoAsignado: formData.medicoAsignado.trim(),
        medicoId: formData.medicoId,
        estado: formData.estado,
        notas: formData.notas.trim(),
        codigoCups: formData.codigoCups,
        duracion: parseInt(formData.duracion || '30'), // Duración en minutos
        // Include complete CUPS information if selected
        ...(selectedCupData && {
          informacionCups: selectedCupData
        })
      };

      const jsonData = JSON.stringify(appointmentData);
      console.log('📤 Enviando datos de cita:', appointmentData);

      // Store debug info for potential error display
      setDebugInfo({
        url: `POST /api/citas/paciente/${patientId}`,
        requestData: appointmentData,
        jsonData: jsonData
      });

      // Call the API to create the appointment
      const response = await pacientesApiService.createAppointment(patientId, jsonData);
      console.log('📥 Respuesta del servidor:', response);

      // Check if response indicates success
      // Backend returns either: {success: true, data: {...}} or just the data object directly
      const isSuccess = response && (
        response.success === true ||
        (response.id && response.pacienteId && response.datosJson) // Direct data object
      );

      if (isSuccess) {
        appointmentCreated = true;
        const appointmentData = response.data || response; // Handle both formats
        console.log('✅ Cita creada exitosamente:', appointmentData);

        // Reset form
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

        // Close modal and notify parent
        onClose();
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }

        // Show success SweetAlert after modal is closed
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

        return; // Exit early to prevent going to catch block
      } else {
        // Handle API error response
        const errorMessage = response?.error || response?.message || 'Error desconocido del servidor';
        console.error('❌ Error en respuesta del servidor:', response);
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
        response: response
      } : {
        url: `POST /api/citas/paciente/${patientId}`,
        requestData: formData,
        error: error.message,
        response: response || 'No response received'
      });

      // Also show SweetAlert for additional feedback
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });

      // Keep modal open on error
      console.log('🔄 Modal permanece abierto debido al error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-11/12 max-w-4xl h-5/6">
          {/* Header */}
          <ScheduleAppointmentHeader
            patientName={patientName}
            loading={loading}
            onClose={onClose}
          />

          {/* Form */}
          <ScheduleAppointmentForm
            formData={formData}
            errors={errors}
            submitError={submitError}
            debugInfo={debugInfo}
            codigosCups={codigosCups}
            loadingCodigosCups={loadingCodigosCups}
            medicos={medicos}
            loadingMedicos={loadingMedicos}
            selectedCupData={selectedCupData}
            patientName={patientName}
            loading={loading}
            onInputChange={handleInputChange}
            onClose={onClose}
            onSubmit={handleSubmit}
            setSubmitError={setSubmitError}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;