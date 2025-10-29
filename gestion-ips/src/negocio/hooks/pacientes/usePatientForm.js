import { useState, useEffect } from 'react';
import { pacientesApiService } from '../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

// Helper functions for JSON parsing/stringifying
export const parseJsonSafely = (jsonString) => {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
  }
};

export const stringifyJsonSafely = (obj) => {
  if (!obj || Object.keys(obj).length === 0) return null;
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying JSON:', error);
    return null;
  }
};

// Validation utilities
export const validatePatientForm = (formData, parsedData) => {
  const errors = {};

  // Basic information validation
  if (!formData.numeroDocumento.trim()) {
    errors.numeroDocumento = 'El número de documento es requerido';
  }

  // Personal information validation
  if (!parsedData.informacionPersonal.primerNombre.trim()) {
    errors.primerNombre = 'El primer nombre es requerido';
  }
  if (!parsedData.informacionPersonal.primerApellido.trim()) {
    errors.primerApellido = 'El primer apellido es requerido';
  }
  if (!parsedData.informacionPersonal.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
  }
  if (!parsedData.informacionPersonal.genero) {
    errors.genero = 'El género es requerido';
  }

  // Contact information validation
  if (!parsedData.informacionContacto.telefono.trim()) {
    errors.telefono = 'El teléfono es requerido';
  }

  // Email validation if provided
  if (parsedData.informacionContacto.email && !/\S+@\S+\.\S+/.test(parsedData.informacionContacto.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  // Consent validation (required by law)
  if (!parsedData.consentimientoInformado.aceptaTratamiento) {
    errors.consentimientoTratamiento = 'Debe aceptar el consentimiento informado para tratamiento médico';
  }
  if (!parsedData.consentimientoInformado.aceptaPrivacidad) {
    errors.consentimientoPrivacidad = 'Debe aceptar las políticas de privacidad y protección de datos';
  }
  if (!parsedData.consentimientoInformado.aceptaDatosPersonales) {
    errors.consentimientoDatos = 'Debe aceptar el tratamiento de datos personales según la Ley 1581 de 2012';
  }

  // Medical information validation (required by law)
  if (!parsedData.informacionMedica.eps.trim()) {
    errors.eps = 'La EPS es requerida por ley para atención médica';
  }
  if (!parsedData.informacionMedica.regimenAfiliacion) {
    errors.regimenAfiliacion = 'El régimen de afiliación es requerido';
  }

  // Emergency contact validation (required by law)
  if (!parsedData.contactoEmergencia.nombreContacto.trim()) {
    errors.nombreContactoEmergencia = 'El contacto de emergencia es obligatorio por ley';
  }
  if (!parsedData.contactoEmergencia.telefonoContacto.trim()) {
    errors.telefonoContactoEmergencia = 'El teléfono del contacto de emergencia es obligatorio';
  }
  if (!parsedData.contactoEmergencia.relacion.trim()) {
    errors.relacionContactoEmergencia = 'La relación con el contacto de emergencia es obligatoria';
  }

  return errors;
};

// Default form data structure
const getDefaultFormData = () => ({
  numeroDocumento: '',
  tipoDocumento: 'CC',
  informacionPersonalJson: null,
  informacionContactoJson: null,
  informacionMedicaJson: null,
  contactoEmergenciaJson: null,
  consentimientoInformadoJson: null,
  activo: true
});

const getDefaultParsedData = () => ({
  informacionPersonal: {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    genero: '',
    estadoCivil: '',
    tipoSangre: '',
    ocupacion: '',
    nivelEducativo: '',
    nacionalidad: 'Colombiana',
    estratoSocioeconomico: '',
    grupoEtnico: '',
    discapacidad: '',
    telefonoMovil: ''
  },
  informacionContacto: {
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: 'Colombia'
  },
  informacionMedica: {
    eps: '',
    tipoSeguro: '',
    regimenAfiliacion: '',
    alergias: '',
    medicamentosActuales: '',
    observacionesMedicas: '',
    antecedentesPersonales: '',
    antecedentesFamiliares: '',
    antecedentesQuirurgicos: '',
    antecedentesAlergicos: '',
    enfermedadesCronicas: '',
    cirugiasPrevias: '',
    hospitalizacionesPrevias: '',
    vacunas: '',
    habitos: {
      tabaquismo: '',
      alcoholismo: '',
      drogadiccion: '',
      ejercicio: '',
      alimentacion: '',
      sueno: '',
      higiene: ''
    }
  },
  contactoEmergencia: {
    nombreContacto: '',
    telefonoContacto: '',
    relacion: '',
    telefonoContactoSecundario: ''
  },
  consentimientoInformado: {
    aceptaTratamiento: false,
    aceptaPrivacidad: false,
    aceptaDatosPersonales: false,
    aceptaImagenes: false,
    fechaConsentimiento: '',
    testigoConsentimiento: ''
  }
});

// API response processing
const processApiResponse = (response) => {
  try {
    if (response.datosJson) {
      const parsedData = parseJsonSafely(response.datosJson);

      const patientListStructure = {
        informacionPersonal: parsedData.informacionPersonalJson ? parseJsonSafely(parsedData.informacionPersonalJson) : {},
        informacionContacto: parsedData.informacionContactoJson ? parseJsonSafely(parsedData.informacionContactoJson) : {},
        informacionMedica: parsedData.informacionMedicaJson ? parseJsonSafely(parsedData.informacionMedicaJson) : {},
        contactoEmergencia: parsedData.contactoEmergenciaJson ? parseJsonSafely(parsedData.contactoEmergenciaJson) : {},
        consentimientoInformado: parsedData.consentimientoInformadoJson ? parseJsonSafely(parsedData.consentimientoInformadoJson) : {}
      };

      const mergedResponse = {
        ...response,
        datosJson: stringifyJsonSafely({
          datosJson: stringifyJsonSafely(patientListStructure)
        }),
        informacionPersonalJson: parsedData.informacionPersonalJson || response.informacionPersonalJson,
        informacionContactoJson: parsedData.informacionContactoJson || response.informacionContactoJson,
        informacionMedicaJson: parsedData.informacionMedicaJson || response.informacionMedicaJson,
        contactoEmergenciaJson: parsedData.contactoEmergenciaJson || response.contactoEmergenciaJson,
        nombreCompleto: response.nombreCompleto || generateNombreCompleto(patientListStructure),
        fechaCreacion: formatDateArray(response.fechaCreacion),
        fechaActualizacion: formatDateArray(response.fechaActualizacion)
      };

      return mergedResponse;
    }

    return response;
  } catch (error) {
    console.error('Error procesando respuesta de API:', error);
    return response;
  }
};

const formatDateArray = (dateArray) => {
  if (!Array.isArray(dateArray) || dateArray.length < 6) {
    return dateArray;
  }

  try {
    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateArray;
  }
};

const generateNombreCompleto = (parsedData) => {
  try {
    if (parsedData.informacionPersonalJson) {
      const personalData = parseJsonSafely(parsedData.informacionPersonalJson);
      return `${personalData.primerNombre || ''} ${personalData.segundoNombre || ''} ${personalData.primerApellido || ''} ${personalData.segundoApellido || ''}`.trim();
    }
    return '';
  } catch (error) {
    console.error('Error generando nombre completo:', error);
    return '';
  }
};

// Parse patient data for editing
const parsePatientDataForEdit = (patient) => {
  try {
    if (patient.datosJson) {
      const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

      if (firstLevel.datosJson) {
        const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;

        return {
          informacionPersonal: {
            primerNombre: secondLevel.informacionPersonal?.primerNombre || '',
            segundoNombre: secondLevel.informacionPersonal?.segundoNombre || '',
            primerApellido: secondLevel.informacionPersonal?.primerApellido || '',
            segundoApellido: secondLevel.informacionPersonal?.segundoApellido || '',
            fechaNacimiento: secondLevel.informacionPersonal?.fechaNacimiento || '',
            genero: secondLevel.informacionPersonal?.genero || '',
            estadoCivil: secondLevel.informacionPersonal?.estadoCivil || '',
            tipoSangre: secondLevel.informacionPersonal?.tipoSangre || '',
            ocupacion: secondLevel.informacionPersonal?.ocupacion || '',
            nivelEducativo: secondLevel.informacionPersonal?.nivelEducativo || '',
            nacionalidad: secondLevel.informacionPersonal?.nacionalidad || 'Colombiana',
            estratoSocioeconomico: secondLevel.informacionPersonal?.estratoSocioeconomico || '',
            grupoEtnico: secondLevel.informacionPersonal?.grupoEtnico || '',
            discapacidad: secondLevel.informacionPersonal?.discapacidad || '',
            telefonoMovil: secondLevel.informacionPersonal?.telefonoMovil || ''
          },
          informacionContacto: {
            telefono: secondLevel.informacionContacto?.telefono || '',
            email: secondLevel.informacionContacto?.email || '',
            direccion: secondLevel.informacionContacto?.direccion || '',
            ciudad: secondLevel.informacionContacto?.ciudad || '',
            departamento: secondLevel.informacionContacto?.departamento || '',
            pais: secondLevel.informacionContacto?.pais || 'Colombia'
          },
          informacionMedica: {
            eps: secondLevel.informacionMedica?.eps || '',
            tipoSeguro: secondLevel.informacionMedica?.tipoSeguro || '',
            regimenAfiliacion: secondLevel.informacionMedica?.regimenAfiliacion || '',
            alergias: secondLevel.informacionMedica?.alergias || '',
            medicamentosActuales: secondLevel.informacionMedica?.medicamentosActuales || '',
            observacionesMedicas: secondLevel.informacionMedica?.observacionesMedicas || '',
            antecedentesPersonales: secondLevel.informacionMedica?.antecedentesPersonales || '',
            antecedentesFamiliares: secondLevel.informacionMedica?.antecedentesFamiliares || '',
            antecedentesQuirurgicos: secondLevel.informacionMedica?.antecedentesQuirurgicos || '',
            antecedentesAlergicos: secondLevel.informacionMedica?.antecedentesAlergicos || '',
            enfermedadesCronicas: secondLevel.informacionMedica?.enfermedadesCronicas || '',
            cirugiasPrevias: secondLevel.informacionMedica?.cirugiasPrevias || '',
            hospitalizacionesPrevias: secondLevel.informacionMedica?.hospitalizacionesPrevias || '',
            vacunas: secondLevel.informacionMedica?.vacunas || '',
            habitos: secondLevel.informacionMedica?.habitos || {
              tabaquismo: '',
              alcoholismo: '',
              drogadiccion: '',
              ejercicio: '',
              alimentacion: '',
              sueno: '',
              higiene: ''
            }
          },
          contactoEmergencia: {
            nombreContacto: secondLevel.contactoEmergencia?.nombreContacto || '',
            telefonoContacto: secondLevel.contactoEmergencia?.telefonoContacto || '',
            relacion: secondLevel.contactoEmergencia?.relacion || '',
            telefonoContactoSecundario: secondLevel.contactoEmergencia?.telefonoContactoSecundario || ''
          },
          consentimientoInformado: secondLevel.consentimientoInformado || {
            aceptaTratamiento: false,
            aceptaPrivacidad: false,
            aceptaDatosPersonales: false,
            aceptaImagenes: false,
            fechaConsentimiento: '',
            testigoConsentimiento: ''
          }
        };
      }

      if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
        const infoPersonal = firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {};
        const infoContacto = firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {};
        const infoMedica = firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {};
        const contactoEmergencia = firstLevel.contactoEmergenciaJson ? JSON.parse(firstLevel.contactoEmergenciaJson) : {};
        const consentimiento = firstLevel.consentimientoInformadoJson ? JSON.parse(firstLevel.consentimientoInformadoJson) : {};

        return {
          informacionPersonal: {
            primerNombre: infoPersonal.primerNombre || '',
            segundoNombre: infoPersonal.segundoNombre || '',
            primerApellido: infoPersonal.primerApellido || '',
            segundoApellido: infoPersonal.segundoApellido || '',
            fechaNacimiento: infoPersonal.fechaNacimiento || '',
            genero: infoPersonal.genero || '',
            estadoCivil: infoPersonal.estadoCivil || '',
            tipoSangre: infoPersonal.tipoSangre || '',
            ocupacion: infoPersonal.ocupacion || '',
            nivelEducativo: infoPersonal.nivelEducativo || '',
            nacionalidad: infoPersonal.nacionalidad || 'Colombiana',
            estratoSocioeconomico: infoPersonal.estratoSocioeconomico || '',
            grupoEtnico: infoPersonal.grupoEtnico || '',
            discapacidad: infoPersonal.discapacidad || '',
            telefonoMovil: infoPersonal.telefonoMovil || ''
          },
          informacionContacto: {
            telefono: infoContacto.telefono || '',
            email: infoContacto.email || '',
            direccion: infoContacto.direccion || '',
            ciudad: infoContacto.ciudad || '',
            departamento: infoContacto.departamento || '',
            pais: infoContacto.pais || 'Colombia'
          },
          informacionMedica: {
            eps: infoMedica.eps || '',
            tipoSeguro: infoMedica.tipoSeguro || '',
            regimenAfiliacion: infoMedica.regimenAfiliacion || '',
            alergias: infoMedica.alergias || '',
            medicamentosActuales: infoMedica.medicamentosActuales || '',
            observacionesMedicas: infoMedica.observacionesMedicas || '',
            antecedentesPersonales: infoMedica.antecedentesPersonales || '',
            antecedentesFamiliares: infoMedica.antecedentesFamiliares || '',
            antecedentesQuirurgicos: infoMedica.antecedentesQuirurgicos || '',
            antecedentesAlergicos: infoMedica.antecedentesAlergicos || '',
            enfermedadesCronicas: infoMedica.enfermedadesCronicas || '',
            cirugiasPrevias: infoMedica.cirugiasPrevias || '',
            hospitalizacionesPrevias: infoMedica.hospitalizacionesPrevias || '',
            vacunas: infoMedica.vacunas || '',
            habitos: infoMedica.habitos || {
              tabaquismo: '',
              alcoholismo: '',
              drogadiccion: '',
              ejercicio: '',
              alimentacion: '',
              sueno: '',
              higiene: ''
            }
          },
          contactoEmergencia: {
            nombreContacto: contactoEmergencia.nombreContacto || '',
            telefonoContacto: contactoEmergencia.telefonoContacto || '',
            relacion: contactoEmergencia.relacion || '',
            telefonoContactoSecundario: contactoEmergencia.telefonoContactoSecundario || ''
          },
          consentimientoInformado: consentimiento || {
            aceptaTratamiento: false,
            aceptaPrivacidad: false,
            aceptaDatosPersonales: false,
            aceptaImagenes: false,
            fechaConsentimiento: '',
            testigoConsentimiento: ''
          }
        };
      }
    }
  } catch (error) {
    console.error('Error parsing patient data for edit:', error);
  }

  return getDefaultParsedData();
};

export const usePatientForm = (editingPatient = null, prefillDocumentNumber = '') => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState(getDefaultFormData());
  const [parsedData, setParsedData] = useState(getDefaultParsedData());

  // Pre-fill document number when modal opens
  useEffect(() => {
    if (prefillDocumentNumber) {
      setFormData(prev => ({
        ...prev,
        numeroDocumento: prefillDocumentNumber
      }));
    }
  }, [prefillDocumentNumber]);

  // Pre-fill form when editing a patient
  useEffect(() => {
    if (editingPatient) {
      try {
        const patientData = parsePatientDataForEdit(editingPatient);

        setFormData({
          numeroDocumento: editingPatient.numeroDocumento || '',
          tipoDocumento: editingPatient.tipoDocumento || 'CC',
          informacionPersonalJson: null,
          informacionContactoJson: null,
          informacionMedicaJson: null,
          contactoEmergenciaJson: null,
          consentimientoInformadoJson: null,
          activo: Object.prototype.hasOwnProperty.call(editingPatient, 'activo') ? editingPatient.activo : true
        });

        setParsedData(patientData);
      } catch (error) {
        console.error('Error pre-filling edit form:', error);
      }
    } else {
      // Reset form when not editing (for create mode)
      setFormData(getDefaultFormData());
      setParsedData(getDefaultParsedData());
    }
  }, [editingPatient]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setParsedData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section]),
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = validatePatientForm(formData, parsedData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = async (onPatientCreated) => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Filtrar valores por defecto antes de enviar
      const cleanInformacionMedica = { ...parsedData.informacionMedica };
      if (cleanInformacionMedica.alergias === 'Ninguna') cleanInformacionMedica.alergias = '';
      if (cleanInformacionMedica.medicamentosActuales === 'Ninguno') cleanInformacionMedica.medicamentosActuales = '';
      if (cleanInformacionMedica.observacionesMedicas === 'Ninguna') cleanInformacionMedica.observacionesMedicas = '';

      // Agregar fecha de consentimiento si se aceptó
      const consentimientoData = { ...parsedData.consentimientoInformado };
      if (consentimientoData.aceptaTratamiento && consentimientoData.aceptaPrivacidad) {
        consentimientoData.fechaConsentimiento = new Date().toISOString().split('T')[0];
      }

      // Convertir los objetos parsedData a JSON strings antes de enviar
      const dataToSend = {
        ...formData,
        informacionPersonalJson: stringifyJsonSafely(parsedData.informacionPersonal),
        informacionContactoJson: stringifyJsonSafely(parsedData.informacionContacto),
        informacionMedicaJson: stringifyJsonSafely(cleanInformacionMedica),
        contactoEmergenciaJson: stringifyJsonSafely(parsedData.contactoEmergencia),
        consentimientoInformadoJson: stringifyJsonSafely(consentimientoData)
      };

      console.log('Enviando datos del paciente:', JSON.stringify(dataToSend, null, 2));

      let result;
      let processedResult;

      if (editingPatient) {
        const updateData = {
          numeroDocumento: dataToSend.numeroDocumento,
          tipoDocumento: dataToSend.tipoDocumento,
          activo: dataToSend.activo,
          datosJson: stringifyJsonSafely({
            informacionPersonalJson: dataToSend.informacionPersonalJson,
            informacionContactoJson: dataToSend.informacionContactoJson,
            informacionMedicaJson: dataToSend.informacionMedicaJson,
            contactoEmergenciaJson: dataToSend.contactoEmergenciaJson,
            consentimientoInformadoJson: dataToSend.consentimientoInformadoJson
          })
        };

        console.log('Enviando datos de actualización:', JSON.stringify(updateData, null, 2));

        result = await pacientesApiService.updatePaciente(editingPatient.id, updateData);
        processedResult = processApiResponse(result);

        await Swal.fire({
          icon: 'success',
          title: '¡Paciente actualizado exitosamente!',
          text: `Los datos del paciente ${processedResult.nombreCompleto || 'han sido actualizados'}`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#10B981'
        });
      } else {
        result = await pacientesApiService.createPaciente(dataToSend);
        processedResult = processApiResponse(result);

        await Swal.fire({
          icon: 'success',
          title: '¡Paciente creado exitosamente!',
          text: `El paciente ${processedResult.nombreCompleto || 'ha sido registrado'} con ID: ${processedResult.id}`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B82F6'
        });
      }

      console.log('Respuesta del backend:', result);

      // Reset form only for creation, not for editing
      if (!editingPatient) {
        setFormData(getDefaultFormData());
        setParsedData(getDefaultParsedData());
      }

      onPatientCreated?.(processedResult);
      return true; // Success
    } catch (err) {
      console.error('Error al guardar paciente:', err);

      await Swal.fire({
        icon: 'error',
        title: 'Error al crear paciente',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar paciente');
      return false; // Failure
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    parsedData,
    saving,
    error,
    validationErrors,
    handleInputChange,
    handleNestedInputChange,
    submitForm,
    validateForm
  };
};