/**
 * Hook personalizado para la gestión de historias clínicas
 * Presentation Layer - Hooks
 */
import { useState, useCallback } from 'react';
import { historiasClinicasApiService, pacientesApiService } from '../../services/pacientesApiService.js';
import Swal from 'sweetalert2';

export const useHistoriaClinica = () => {
  // Estados para el formulario de historia clínica
  const [formData, setFormData] = useState({
    pacienteId: '',
    fechaApertura: new Date().toISOString().split('T')[0],
    informacionMedico: {
      medicoResponsable: '',
      registroMedico: '',
      especialidad: ''
    },
    informacionConsulta: {
      motivoConsulta: '',
      enfermedadActual: '',
      revisionSistemas: '',
      medicamentosActuales: '',
      observaciones: ''
    },
    antecedentesClinico: {
      antecedentesPersonales: '',
      antecedentesFamiliares: '',
      antecedentesQuirurgicos: '',
      antecedentesAlergicos: ''
    },
    examenClinico: {
      examenFisico: '',
      signosVitales: ''
    },
    diagnosticoTratamiento: {
      diagnosticos: '',
      planTratamiento: ''
    },
    firmaDigital: {
      nombreMedico: '',
      numeroCedula: '',
      especialidad: '',
      fechaFirma: new Date().toISOString().split('T')[0]
    },
    activa: true
  });

  // Estados para el proceso
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estados para validación
  const [validationErrors, setValidationErrors] = useState({});

  // Función para inicializar el formulario con datos de cita
  const initializeFromCita = useCallback((pacienteId, citaData) => {
    setFormData(prev => ({
      ...prev,
      pacienteId: pacienteId || prev.pacienteId,
      informacionMedico: {
        medicoResponsable: citaData?.medicoAsignado || prev.informacionMedico.medicoResponsable,
        registroMedico: prev.informacionMedico.registroMedico,
        especialidad: citaData?.especialidad || prev.informacionMedico.especialidad
      },
      informacionConsulta: {
        motivoConsulta: citaData?.motivo || prev.informacionConsulta.motivoConsulta,
        enfermedadActual: prev.informacionConsulta.enfermedadActual,
        revisionSistemas: prev.informacionConsulta.revisionSistemas,
        medicamentosActuales: prev.informacionConsulta.medicamentosActuales,
        observaciones: citaData?.notas || prev.informacionConsulta.observaciones
      },
      firmaDigital: {
        nombreMedico: citaData?.medicoAsignado || prev.firmaDigital.nombreMedico,
        numeroCedula: prev.firmaDigital.numeroCedula,
        especialidad: citaData?.especialidad || prev.firmaDigital.especialidad,
        fechaFirma: new Date().toISOString().split('T')[0]
      }
    }));
  }, []);

  // Función para validar el formulario
  const validateForm = useCallback(() => {
    const errors = {};

    // Validaciones básicas
    if (!formData.pacienteId) {
      errors.pacienteId = 'El ID del paciente es requerido';
    }

    if (!formData.fechaApertura) {
      errors.fechaApertura = 'La fecha de apertura es requerida';
    }

    if (!formData.informacionMedico.medicoResponsable.trim()) {
      errors.medicoResponsable = 'El médico responsable es requerido';
    }

    if (!formData.informacionConsulta.motivoConsulta.trim()) {
      errors.motivoConsulta = 'El motivo de consulta es requerido';
    }

    if (!formData.firmaDigital.nombreMedico.trim()) {
      errors.nombreMedico = 'El nombre del médico es requerido';
    }

    if (!formData.firmaDigital.numeroCedula.trim()) {
      errors.numeroCedula = 'El número de cédula es requerido';
    }

    if (!formData.firmaDigital.especialidad.trim()) {
      errors.especialidadFirma = 'La especialidad es requerida';
    }

    if (!formData.firmaDigital.fechaFirma) {
      errors.fechaFirma = 'La fecha de firma es requerida';
    }

    // Validación de formato de cédula
    const cedulaRegex = /^\d{8,12}$/;
    if (formData.firmaDigital.numeroCedula && !cedulaRegex.test(formData.firmaDigital.numeroCedula)) {
      errors.numeroCedula = 'El número de cédula debe tener entre 8 y 12 dígitos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Función para manejar cambios en inputs simples
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [validationErrors]);

  // Función para manejar cambios en inputs anidados
  const handleNestedInputChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section]),
        [field]: value
      }
    }));

    // Limpiar error de validación si existe
    const errorKey = section === 'informacionMedico' && field === 'medicoResponsable' ? 'medicoResponsable' :
                     section === 'informacionConsulta' && field === 'motivoConsulta' ? 'motivoConsulta' :
                     section === 'firmaDigital' && field === 'nombreMedico' ? 'nombreMedico' :
                     section === 'firmaDigital' && field === 'numeroCedula' ? 'numeroCedula' :
                     section === 'firmaDigital' && field === 'especialidad' ? 'especialidadFirma' :
                     section === 'firmaDigital' && field === 'fechaFirma' ? 'fechaFirma' : null;

    if (errorKey && validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  }, [validationErrors]);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData({
      pacienteId: '',
      fechaApertura: new Date().toISOString().split('T')[0],
      informacionMedico: {
        medicoResponsable: '',
        registroMedico: '',
        especialidad: ''
      },
      informacionConsulta: {
        motivoConsulta: '',
        enfermedadActual: '',
        revisionSistemas: '',
        medicamentosActuales: '',
        observaciones: ''
      },
      antecedentesClinico: {
        antecedentesPersonales: '',
        antecedentesFamiliares: '',
        antecedentesQuirurgicos: '',
        antecedentesAlergicos: ''
      },
      examenClinico: {
        examenFisico: '',
        signosVitales: ''
      },
      diagnosticoTratamiento: {
        diagnosticos: '',
        planTratamiento: ''
      },
      firmaDigital: {
        nombreMedico: '',
        numeroCedula: '',
        especialidad: '',
        fechaFirma: new Date().toISOString().split('T')[0]
      },
      activa: true
    });
    setValidationErrors({});
    setError(null);
  }, []);

  // Función para crear historia clínica
  const createHistoriaClinica = useCallback(async (citaId = null) => {
    try {
      setSaving(true);
      setError(null);

      // Validar formulario
      if (!validateForm()) {
        await Swal.fire({
          icon: 'warning',
          title: 'Validación Requerida',
          text: 'Por favor, complete todos los campos requeridos antes de guardar.',
          confirmButtonColor: '#F59E0B',
          confirmButtonText: 'Entendido'
        });
        return null;
      }

      // Convertir datos del formulario a JSON
      const datosJson = JSON.stringify({
        informacionMedico: formData.informacionMedico,
        informacionConsulta: formData.informacionConsulta,
        antecedentesClinico: formData.antecedentesClinico,
        examenClinico: formData.examenClinico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        fechaApertura: formData.fechaApertura,
        datosJson: datosJson,
        activa: formData.activa
      };

      console.log('Enviando datos de historia clínica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.createHistoriaClinica(formData.pacienteId, submitData);

      console.log('Respuesta del backend:', result);

      // Actualizar el estado de la cita a ATENDIDO si se proporcionó citaId
      if (citaId) {
        try {
          console.log('Actualizando estado de cita', citaId, 'a ATENDIDO');
          await pacientesApiService.actualizarEstadoCita(citaId, 'ATENDIDO');
          console.log('Estado de cita actualizado exitosamente');
        } catch (citaError) {
          console.error('Error al actualizar estado de cita:', citaError);
          // No fallar la creación de la historia si falla la actualización de cita
        }
      }

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Historia Clínica Creada!',
        text: 'La historia clínica ha sido creada exitosamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      return result;
    } catch (err) {
      console.error('Error al guardar historia clínica:', err);

      const errorMessage = err.message || 'Ha ocurrido un error al guardar la historia clínica. Por favor, inténtelo nuevamente.';

      // Mostrar mensaje de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Historia Clínica',
        text: errorMessage,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [formData, validateForm]);

  // Función para obtener vista previa de la firma digital
  const getFirmaPreview = useCallback(() => {
    return {
      nombreMedico: formData.firmaDigital?.nombreMedico || 'Nombre del Médico',
      numeroCedula: formData.firmaDigital?.numeroCedula || 'Número de Cédula',
      especialidad: formData.firmaDigital?.especialidad || 'Especialidad',
      fechaFirma: formData.firmaDigital?.fechaFirma ?
        new Date(formData.firmaDigital.fechaFirma).toLocaleDateString('es-CO') :
        'Fecha de Firma'
    };
  }, [formData.firmaDigital]);

  // Función para generar PDF de historia clínica
  const generateHistoriaClinicaPDF = useCallback(async (historiaData) => {
    try {
      const { HistoriaClinicaPDFGenerator } = await import('../components/historiaClinica/index.js');
      const generator = new HistoriaClinicaPDFGenerator();
      await generator.generatePDF(historiaData);
    } catch (error) {
      console.error('Error generando PDF de historia clínica:', error);
      throw error;
    }
  }, []);

  return {
    // Estados
    formData,
    saving,
    error,
    validationErrors,

    // Acciones
    setFormData,

    // Funciones
    initializeFromCita,
    validateForm,
    handleInputChange,
    handleNestedInputChange,
    resetForm,
    createHistoriaClinica,
    getFirmaPreview,
    generateHistoriaClinicaPDF
  };
};