import React, { useState } from 'react';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService, codigosCupsApiService } from '../../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../../data/services/empleadosApiService.js';
import { notifications } from '@mantine/notifications';
import { Select } from '@mantine/core';
import Swal from 'sweetalert2';
import { ESTADO_CITA_AGENDAR_OPTIONS, DURACION_CITA_OPTIONS } from '../../../../negocio/utils/listHelps.js';

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

  const getMinDateTime = () => {
    const now = new Date();
    // Add 1 hour from now to give some buffer time
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Format for datetime-local input
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
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-white">
                      Agendar Cita Médica
                    </h3>
                    {loading && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="ml-2 text-sm text-blue-100">Agendando...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-blue-100">
                    Paciente: {patientName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Primera fila: Fecha/Hora, Médico, Código CUPS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fechaHoraCita}
                    onChange={(e) => handleInputChange('fechaHoraCita', e.target.value)}
                    min={getMinDateTime()}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fechaHoraCita ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.fechaHoraCita && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaHoraCita}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Médico *
                  </label>
                  <select
                    value={formData.medicoAsignado}
                    onChange={(e) => handleInputChange('medicoAsignado', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.medicoAsignado ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    disabled={loadingMedicos}
                  >
                    <option value="">
                      {loadingMedicos ? 'Cargando...' : 'Seleccionar médico'}
                    </option>
                    {medicos.map((medico) => (
                      <option key={medico.id} value={getNombreCompletoMedico(medico)}>
                        {getNombreCompletoMedico(medico)}
                      </option>
                    ))}
                  </select>
                  {errors.medicoAsignado && (
                    <p className="mt-1 text-sm text-red-600">{errors.medicoAsignado}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código CUPS *
                  </label>
                  <Select
                    placeholder="Buscar código..."
                    data={codigosCups.map((codigo) => ({
                      value: codigo.codigoCup,
                      label: `${codigo.codigoCup} - ${codigo.nombreCup}`
                    }))}
                    value={formData.codigoCups}
                    onChange={(value) => handleInputChange('codigoCups', value)}
                    searchable
                    clearable={false}
                    disabled={loadingCodigosCups}
                    required
                    error={errors.codigoCups}
                  />
                </div>
              </div>

              {/* Segunda fila: Motivo y Estado/Duración */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    value={formData.motivo}
                    onChange={(e) => handleInputChange('motivo', e.target.value)}
                    rows={2}
                    placeholder="Describa el motivo de la consulta médica..."
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.motivo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.motivo && (
                    <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckIcon className="h-4 w-4 inline mr-2" />
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ESTADO_CITA_AGENDAR_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-2" />
                      Duración
                    </label>
                    <select
                      value={formData.duracion || '30'}
                      onChange={(e) => handleInputChange('duracion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DURACION_CITA_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Información del Código CUPS seleccionado */}
              {selectedCupData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Información CUPS</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {selectedCupData.categoria && (
                      <div>
                        <span className="font-medium text-blue-800">Categoría:</span>
                        <p className="text-blue-700">{selectedCupData.categoria}</p>
                      </div>
                    )}
                    {selectedCupData.especialidad && (
                      <div>
                        <span className="font-medium text-blue-800">Especialidad:</span>
                        <p className="text-blue-700">{selectedCupData.especialidad}</p>
                      </div>
                    )}
                    {selectedCupData.tipo && (
                      <div>
                        <span className="font-medium text-blue-800">Tipo:</span>
                        <p className="text-blue-700">{selectedCupData.tipo}</p>
                      </div>
                    )}
                    {selectedCupData.ambito && (
                      <div>
                        <span className="font-medium text-blue-800">Ámbito:</span>
                        <p className="text-blue-700">{selectedCupData.ambito}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  rows={2}
                  placeholder="Información adicional, instrucciones especiales, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {submitError.title}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{submitError.message}</p>
                      </div>
                      <div className="mt-3">
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setSubmitError(null)}
                            className="text-sm font-medium text-red-800 hover:text-red-600"
                          >
                            Entendido
                          </button>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                              Ver detalles técnicos
                            </summary>
                            <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900">
                              {debugInfo && (
                                <>
                                  <div className="mb-2">
                                    <strong>URL:</strong> {debugInfo.url}
                                  </div>
                                  <div className="mb-2">
                                    <strong>Datos enviados:</strong>
                                    <pre className="mt-1 whitespace-pre-wrap">
                                      {JSON.stringify(debugInfo.requestData, null, 2)}
                                    </pre>
                                  </div>
                                  {debugInfo.error && (
                                    <div className="mb-2">
                                      <strong>Error del cliente:</strong> {debugInfo.error}
                                    </div>
                                  )}
                                  {debugInfo.response && (
                                    <div>
                                      <strong>Respuesta del servidor:</strong>
                                      <pre className="mt-1 whitespace-pre-wrap">
                                        {JSON.stringify(debugInfo.response, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del paciente y acciones */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t">
                <div className="bg-gray-50 p-3 rounded-lg flex-1">
                  <div className="text-sm text-gray-600">
                    <p><strong>Paciente:</strong> {patientName}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Agendando...
                      </div>
                    ) : (
                      'Agendar Cita'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;