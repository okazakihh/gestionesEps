/**
 * Hook personalizado para la gestión de historias clínicas
 * Presentation Layer - Hooks
 */
import { useState, useCallback } from 'react';
import { historiasClinicasApiService, pacientesApiService } from '../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

export const useHistoriaClinica = () => {
  // Estados para el formulario de historia cl├¡nica
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

  // Estados para validaci├│n
  const [validationErrors, setValidationErrors] = useState({});

  // Funci├│n para inicializar el formulario con datos de cita
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

  // Funci├│n para validar el formulario
  const validateForm = useCallback(() => {
    const errors = {};

    // Validaciones b├ísicas
    if (!formData.pacienteId) {
      errors.pacienteId = 'El ID del paciente es requerido';
    }

    if (!formData.fechaApertura) {
      errors.fechaApertura = 'La fecha de apertura es requerida';
    }

    if (!formData.informacionMedico.medicoResponsable.trim()) {
      errors.medicoResponsable = 'El m├®dico responsable es requerido';
    }

    if (!formData.informacionConsulta.motivoConsulta.trim()) {
      errors.motivoConsulta = 'El motivo de consulta es requerido';
    }

    if (!formData.firmaDigital.nombreMedico.trim()) {
      errors.nombreMedico = 'El nombre del m├®dico es requerido';
    }

    if (!formData.firmaDigital.numeroCedula.trim()) {
      errors.numeroCedula = 'El n├║mero de c├®dula es requerido';
    }

    if (!formData.firmaDigital.especialidad.trim()) {
      errors.especialidadFirma = 'La especialidad es requerida';
    }

    if (!formData.firmaDigital.fechaFirma) {
      errors.fechaFirma = 'La fecha de firma es requerida';
    }

    // Validaci├│n de formato de c├®dula
    const cedulaRegex = /^\d{8,12}$/;
    if (formData.firmaDigital.numeroCedula && !cedulaRegex.test(formData.firmaDigital.numeroCedula)) {
      errors.numeroCedula = 'El n├║mero de c├®dula debe tener entre 8 y 12 d├¡gitos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Funci├│n para manejar cambios en inputs simples
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de validaci├│n si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [validationErrors]);

  // Funci├│n para manejar cambios en inputs anidados
  const handleNestedInputChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section]),
        [field]: value
      }
    }));

    // Limpiar error de validaci├│n si existe
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

  // Funci├│n para resetear el formulario
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

  // Funci├│n para crear historia cl├¡nica
  const createHistoriaClinica = useCallback(async (citaId = null) => {
    try {
      setSaving(true);
      setError(null);

      // Validar formulario
      if (!validateForm()) {
        await Swal.fire({
          icon: 'warning',
          title: 'Validaci├│n Requerida',
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

      console.log('Enviando datos de historia cl├¡nica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.createHistoriaClinica(formData.pacienteId, submitData);

      console.log('Respuesta del backend:', result);

      // Actualizar el estado de la cita a ATENDIDO si se proporcion├│ citaId
      if (citaId) {
        try {
          console.log('Actualizando estado de cita', citaId, 'a ATENDIDO');
          await pacientesApiService.actualizarEstadoCita(citaId, 'ATENDIDO');
          console.log('Estado de cita actualizado exitosamente');
        } catch (citaError) {
          console.error('Error al actualizar estado de cita:', citaError);
          // No fallar la creaci├│n de la historia si falla la actualizaci├│n de cita
        }
      }

      // Mostrar mensaje de ├®xito
      await Swal.fire({
        icon: 'success',
        title: '┬íHistoria Cl├¡nica Creada!',
        text: 'La historia cl├¡nica ha sido creada exitosamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      return result;
    } catch (err) {
      console.error('Error al guardar historia cl├¡nica:', err);

      const errorMessage = err.message || 'Ha ocurrido un error al guardar la historia cl├¡nica. Por favor, int├®ntelo nuevamente.';

      // Mostrar mensaje de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Historia Cl├¡nica',
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

  // Funci├│n para obtener vista previa de la firma digital
  const getFirmaPreview = useCallback(() => {
    return {
      nombreMedico: formData.firmaDigital?.nombreMedico || 'Nombre del M├®dico',
      numeroCedula: formData.firmaDigital?.numeroCedula || 'N├║mero de C├®dula',
      especialidad: formData.firmaDigital?.especialidad || 'Especialidad',
      fechaFirma: formData.firmaDigital?.fechaFirma ?
        new Date(formData.firmaDigital.fechaFirma).toLocaleDateString('es-CO') :
        'Fecha de Firma'
    };
  }, [formData.firmaDigital]);

  // Función para generar PDF de historia clínica
  const generateHistoriaClinicaPDF = useCallback(async (historiaData) => {
    try {
      const { HistoriaClinicaPDFGenerator } = await import('../../presentacion/components/historiaClinica/index.js');
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
