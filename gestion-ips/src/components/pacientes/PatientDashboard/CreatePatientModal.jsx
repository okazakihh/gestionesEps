import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { pacientesApiService } from '../../../services/pacientesApiService.js';

// Función helper para parsear JSON de manera segura
const parseJsonSafely = (jsonString) => {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
  }
};

// Función helper para convertir objeto a JSON string
const stringifyJsonSafely = (obj) => {
  if (!obj || Object.keys(obj).length === 0) return null;
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying JSON:', error);
    return null;
  }
};

const CreatePatientModal = ({ isOpen, onClose, onPatientCreated, prefillDocumentNumber, editingPatient }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    numeroDocumento: '',
    tipoDocumento: 'CC',
    informacionPersonalJson: null,
    informacionContactoJson: null,
    informacionMedicaJson: null,
    contactoEmergenciaJson: null,
    consentimientoInformadoJson: null,
    activo: true
  });

  // Estado local para los objetos parseados (para facilitar el manejo del formulario)
  const [parsedData, setParsedData] = useState({
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

  const validateForm = () => {
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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        // For update, we need to send data in a different format
        // The backend expects: numeroDocumento, tipoDocumento, datosJson (single JSON string)
        const updateData = {
          numeroDocumento: dataToSend.numeroDocumento,
          tipoDocumento: dataToSend.tipoDocumento,
          activo: dataToSend.activo,
          // Create a single datosJson field containing all the nested JSON data
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

        // Mostrar SweetAlert de éxito para actualización
        await Swal.fire({
          icon: 'success',
          title: '¡Paciente actualizado exitosamente!',
          text: `Los datos del paciente ${processedResult.nombreCompleto || 'han sido actualizados'}`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#10B981'
        });
      } else {
        // Create new patient
        result = await pacientesApiService.createPaciente(dataToSend);
        processedResult = processApiResponse(result);

        // Mostrar SweetAlert de éxito para creación
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
        setFormData({
          numeroDocumento: '',
          tipoDocumento: 'CC',
          informacionPersonalJson: null,
          informacionContactoJson: null,
          informacionMedicaJson: null,
          contactoEmergenciaJson: null,
          consentimientoInformadoJson: null,
          activo: true
        });

        setParsedData({
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
      }

      onPatientCreated && onPatientCreated(processedResult);
      onClose();
    } catch (err) {
      console.error('Error al guardar paciente:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear paciente',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar paciente');
    } finally {
      setSaving(false);
    }
  };

  // Función para procesar la respuesta de la API y mergear los datos correctamente
  const processApiResponse = (response) => {
    try {
      // Si la respuesta tiene datosJson, parsearlo y crear la estructura correcta para PatientList
      if (response.datosJson) {
        const parsedData = parseJsonSafely(response.datosJson);

        // Crear la estructura que espera PatientList.parsePatientData
        // PatientList espera: patient.datosJson -> { datosJson: "string with parsed objects" }
        const patientListStructure = {
          informacionPersonal: parsedData.informacionPersonalJson ? parseJsonSafely(parsedData.informacionPersonalJson) : {},
          informacionContacto: parsedData.informacionContactoJson ? parseJsonSafely(parsedData.informacionContactoJson) : {},
          informacionMedica: parsedData.informacionMedicaJson ? parseJsonSafely(parsedData.informacionMedicaJson) : {},
          contactoEmergencia: parsedData.contactoEmergenciaJson ? parseJsonSafely(parsedData.contactoEmergenciaJson) : {},
          consentimientoInformado: parsedData.consentimientoInformadoJson ? parseJsonSafely(parsedData.consentimientoInformadoJson) : {}
        };

        // Crear el objeto merged con la información correcta
        const mergedResponse = {
          ...response,
          // Crear la estructura datosJson que espera PatientList exactamente como la espera
          datosJson: stringifyJsonSafely({
            datosJson: stringifyJsonSafely(patientListStructure)
          }),
          // También mantener los campos individuales por si se necesitan
          informacionPersonalJson: parsedData.informacionPersonalJson || response.informacionPersonalJson,
          informacionContactoJson: parsedData.informacionContactoJson || response.informacionContactoJson,
          informacionMedicaJson: parsedData.informacionMedicaJson || response.informacionMedicaJson,
          contactoEmergenciaJson: parsedData.contactoEmergenciaJson || response.contactoEmergenciaJson,
          // Generar nombre completo si no existe
          nombreCompleto: response.nombreCompleto || generateNombreCompleto(patientListStructure),
          // Formatear fechas
          fechaCreacion: formatDateArray(response.fechaCreacion),
          fechaActualizacion: formatDateArray(response.fechaActualizacion)
        };

        console.log('Processed response structure:', {
          originalDatosJson: response.datosJson,
          parsedData,
          patientListStructure,
          finalDatosJson: mergedResponse.datosJson
        });

        return mergedResponse;
      }

      return response;
    } catch (error) {
      console.error('Error procesando respuesta de API:', error);
      return response;
    }
  };

  // Función para formatear arrays de fecha de LocalDateTime
  const formatDateArray = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6) {
      return dateArray;
    }

    try {
      // LocalDateTime comes as [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour, minute, second] = dateArray;
      return new Date(year, month - 1, day, hour, minute, second);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateArray;
    }
  };

  // Función helper para generar nombre completo desde los datos parseados
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

  // Función para parsear datos del paciente para edición
  const parsePatientDataForEdit = (patient) => {
    try {
      if (patient.datosJson) {
        const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

        // Intentar formato anidado primero
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

        // Intentar formato plano
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

    // Valores por defecto si no se puede parsear
    return {
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
    };
  };

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

  // Pre-fill document number when modal opens
  React.useEffect(() => {
    if (isOpen && prefillDocumentNumber) {
      setFormData(prev => ({
        ...prev,
        numeroDocumento: prefillDocumentNumber
      }));
    }
  }, [isOpen, prefillDocumentNumber]);

  // Pre-fill form when editing a patient
  React.useEffect(() => {
    if (isOpen && editingPatient) {
      try {
        // Parse patient data and populate form
        const patientData = parsePatientDataForEdit(editingPatient);

        setFormData({
          numeroDocumento: editingPatient.numeroDocumento || '',
          tipoDocumento: editingPatient.tipoDocumento || 'CC',
          informacionPersonalJson: null,
          informacionContactoJson: null,
          informacionMedicaJson: null,
          contactoEmergenciaJson: null,
          consentimientoInformadoJson: null,
          activo: editingPatient.activo !== undefined ? editingPatient.activo : true
        });

        setParsedData({
          informacionPersonal: patientData.informacionPersonal,
          informacionContacto: patientData.informacionContacto,
          informacionMedica: patientData.informacionMedica,
          contactoEmergencia: patientData.contactoEmergencia
        });
      } catch (error) {
        console.error('Error pre-filling edit form:', error);
      }
    }
  }, [isOpen, editingPatient]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center min-h-full">
              <div className="w-full max-w-4xl">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="tipoDocumento" className="block text-sm font-medium leading-6 text-gray-900">
                        Tipo de Documento
                      </label>
                      <select
                        id="tipoDocumento"
                        value={formData.tipoDocumento}
                        onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PA">Pasaporte</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="RC">Registro Civil</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="numeroDocumento" className="block text-sm font-medium leading-6 text-gray-900">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.numeroDocumento ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.numeroDocumento && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDocumento}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Personal</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="primerNombre" className="block text-sm font-medium leading-6 text-gray-900">
                        Primer Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primerNombre"
                        value={parsedData.informacionPersonal?.primerNombre || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerNombre', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.primerNombre ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.primerNombre && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.primerNombre}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="segundoNombre" className="block text-sm font-medium leading-6 text-gray-900">
                        Segundo Nombre
                      </label>
                      <input
                        type="text"
                        id="segundoNombre"
                        value={parsedData.informacionPersonal?.segundoNombre || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoNombre', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="primerApellido" className="block text-sm font-medium leading-6 text-gray-900">
                        Primer Apellido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primerApellido"
                        value={parsedData.informacionPersonal?.primerApellido || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerApellido', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.primerApellido ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.primerApellido && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.primerApellido}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="segundoApellido" className="block text-sm font-medium leading-6 text-gray-900">
                        Segundo Apellido
                      </label>
                      <input
                        type="text"
                        id="segundoApellido"
                        value={parsedData.informacionPersonal?.segundoApellido || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoApellido', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium leading-6 text-gray-900">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="fechaNacimiento"
                        value={parsedData.informacionPersonal?.fechaNacimiento || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'fechaNacimiento', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.fechaNacimiento ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.fechaNacimiento && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.fechaNacimiento}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="genero" className="block text-sm font-medium leading-6 text-gray-900">
                        Género <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="genero"
                        value={parsedData.informacionPersonal?.genero || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'genero', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          validationErrors.genero ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="M">Masculino/a</option>
                        <option value="F">Femenino/a</option>
                        <option value="O">Otro</option>
                      </select>
                      {validationErrors.genero && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.genero}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="estadoCivil" className="block text-sm font-medium leading-6 text-gray-900">
                        Estado Civil
                      </label>
                      <select
                        id="estadoCivil"
                        value={parsedData.informacionPersonal?.estadoCivil || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'estadoCivil', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="SOLTERO">Soltero</option>
                        <option value="CASADO">Casado</option>
                        <option value="DIVORCIADO">Divorciado</option>
                        <option value="VIUDO">Viudo</option>
                        <option value="UNION_LIBRE">Unión Libre</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="nacionalidad" className="block text-sm font-medium leading-6 text-gray-900">
                        Nacionalidad
                      </label>
                      <input
                        type="text"
                        id="nacionalidad"
                        value={parsedData.informacionPersonal?.nacionalidad || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'nacionalidad', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Colombiana"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="telefonoMovil" className="block text-sm font-medium leading-6 text-gray-900">
                        Teléfono Móvil
                      </label>
                      <input
                        type="tel"
                        id="telefonoMovil"
                        value={parsedData.informacionPersonal?.telefonoMovil || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'telefonoMovil', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="estratoSocioeconomico" className="block text-sm font-medium leading-6 text-gray-900">
                        Estrato Socioeconómico
                      </label>
                      <select
                        id="estratoSocioeconomico"
                        value={parsedData.informacionPersonal?.estratoSocioeconomico || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'estratoSocioeconomico', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="1">Estrato 1</option>
                        <option value="2">Estrato 2</option>
                        <option value="3">Estrato 3</option>
                        <option value="4">Estrato 4</option>
                        <option value="5">Estrato 5</option>
                        <option value="6">Estrato 6</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="ocupacion" className="block text-sm font-medium leading-6 text-gray-900">
                        Ocupación
                      </label>
                      <input
                        type="text"
                        id="ocupacion"
                        value={parsedData.informacionPersonal?.ocupacion || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'ocupacion', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Profesión u oficio"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="nivelEducativo" className="block text-sm font-medium leading-6 text-gray-900">
                        Nivel Educativo
                      </label>
                      <select
                        id="nivelEducativo"
                        value={parsedData.informacionPersonal?.nivelEducativo || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'nivelEducativo', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="NINGUNO">Ninguno</option>
                        <option value="PRIMARIA">Primaria</option>
                        <option value="SECUNDARIA">Secundaria</option>
                        <option value="TECNICO">Técnico</option>
                        <option value="TECNOLOGICO">Tecnológico</option>
                        <option value="PROFESIONAL">Profesional</option>
                        <option value="POSGRADO">Posgrado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información de Contacto</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="telefono" className="block text-sm font-medium leading-6 text-gray-900">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        value={parsedData.informacionContacto?.telefono || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'telefono', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.telefono ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.telefono && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.telefono}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={parsedData.informacionContacto?.email || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'email', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="direccion" className="block text-sm font-medium leading-6 text-gray-900">
                        Dirección
                      </label>
                      <input
                        type="text"
                        id="direccion"
                        value={parsedData.informacionContacto?.direccion || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'direccion', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="ciudad" className="block text-sm font-medium leading-6 text-gray-900">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        id="ciudad"
                        value={parsedData.informacionContacto?.ciudad || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'ciudad', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="departamento" className="block text-sm font-medium leading-6 text-gray-900">
                        Departamento
                      </label>
                      <input
                        type="text"
                        id="departamento"
                        value={parsedData.informacionContacto?.departamento || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'departamento', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Médica</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="eps" className="block text-sm font-medium leading-6 text-gray-900">
                        EPS <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="eps"
                        value={parsedData.informacionMedica?.eps || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'eps', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.eps ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                        placeholder="Nombre de la EPS..."
                      />
                      {validationErrors.eps && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.eps}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="regimenAfiliacion" className="block text-sm font-medium leading-6 text-gray-900">
                        Régimen de Afiliación <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="regimenAfiliacion"
                        value={parsedData.informacionMedica?.regimenAfiliacion || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'regimenAfiliacion', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          validationErrors.regimenAfiliacion ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="CONTRIBUTIVO">Contributivo</option>
                        <option value="SUBSIDIADO">Subsidiado</option>
                        <option value="ESPECIAL">Especial</option>
                        <option value="EXCEPTUADO">Exceptuado</option>
                        <option value="NO_AFILIADO">No Afiliado</option>
                      </select>
                      {validationErrors.regimenAfiliacion && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.regimenAfiliacion}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="tipoSangre" className="block text-sm font-medium leading-6 text-gray-900">
                        Tipo de Sangre
                      </label>
                      <select
                        id="tipoSangre"
                        value={parsedData.informacionPersonal?.tipoSangre || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'tipoSangre', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="alergias" className="block text-sm font-medium leading-6 text-gray-900">
                        Alergias
                      </label>
                      <textarea
                        id="alergias"
                        rows={3}
                        value={parsedData.informacionMedica?.alergias || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'alergias', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Describa las alergias del paciente..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="medicamentosActuales" className="block text-sm font-medium leading-6 text-gray-900">
                        Medicamentos Actuales
                      </label>
                      <textarea
                        id="medicamentosActuales"
                        rows={3}
                        value={parsedData.informacionMedica?.medicamentosActuales || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'medicamentosActuales', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Liste los medicamentos que toma actualmente..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="antecedentesPersonales" className="block text-sm font-medium leading-6 text-gray-900">
                        Antecedentes Médicos Personales
                      </label>
                      <textarea
                        id="antecedentesPersonales"
                        rows={3}
                        value={parsedData.informacionMedica?.antecedentesPersonales || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'antecedentesPersonales', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Describa enfermedades previas, cirugías, hospitalizaciones..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="antecedentesFamiliares" className="block text-sm font-medium leading-6 text-gray-900">
                        Antecedentes Médicos Familiares
                      </label>
                      <textarea
                        id="antecedentesFamiliares"
                        rows={3}
                        value={parsedData.informacionMedica?.antecedentesFamiliares || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'antecedentesFamiliares', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Enfermedades en familiares directos (padres, hermanos, hijos)..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="enfermedadesCronicas" className="block text-sm font-medium leading-6 text-gray-900">
                        Enfermedades Crónicas
                      </label>
                      <textarea
                        id="enfermedadesCronicas"
                        rows={2}
                        value={parsedData.informacionMedica?.enfermedadesCronicas || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'enfermedadesCronicas', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Diabetes, hipertensión, asma, etc."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="vacunas" className="block text-sm font-medium leading-6 text-gray-900">
                        Vacunas y Esquemas de Inmunización
                      </label>
                      <textarea
                        id="vacunas"
                        rows={2}
                        value={parsedData.informacionMedica?.vacunas || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'vacunas', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Vacunas aplicadas y fechas..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="observacionesMedicas" className="block text-sm font-medium leading-6 text-gray-900">
                        Observaciones Médicas Adicionales
                      </label>
                      <textarea
                        id="observacionesMedicas"
                        rows={3}
                        value={parsedData.informacionMedica?.observacionesMedicas || ''}
                        onChange={(e) => handleNestedInputChange('informacionMedica', 'observacionesMedicas', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Observaciones adicionales del estado de salud..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Consentimiento Informado */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Consentimiento Informado</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="font-medium mb-2">Según la Ley 1581 de 2012 y normas relacionadas con historia clínica, el paciente debe otorgar su consentimiento expreso para:</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="aceptaTratamiento"
                            type="checkbox"
                            checked={parsedData.consentimientoInformado?.aceptaTratamiento || false}
                            onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaTratamiento', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="aceptaTratamiento" className="font-medium text-gray-700">
                            Tratamiento Médico <span className="text-red-500">*</span>
                          </label>
                          <p className="text-gray-500">Acepto recibir atención médica y procedimientos diagnósticos necesarios para mi salud.</p>
                          {validationErrors.consentimientoTratamiento && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoTratamiento}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="aceptaPrivacidad"
                            type="checkbox"
                            checked={parsedData.consentimientoInformado?.aceptaPrivacidad || false}
                            onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaPrivacidad', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="aceptaPrivacidad" className="font-medium text-gray-700">
                            Protección de Datos Personales <span className="text-red-500">*</span>
                          </label>
                          <p className="text-gray-500">Acepto el tratamiento de mis datos personales según la Ley 1581 de 2012 y normas de protección de datos.</p>
                          {validationErrors.consentimientoPrivacidad && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoPrivacidad}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="aceptaDatosPersonales"
                            type="checkbox"
                            checked={parsedData.consentimientoInformado?.aceptaDatosPersonales || false}
                            onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaDatosPersonales', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="aceptaDatosPersonales" className="font-medium text-gray-700">
                            Tratamiento de Datos Sensibles <span className="text-red-500">*</span>
                          </label>
                          <p className="text-gray-500">Acepto el tratamiento de datos sensibles de salud según la legislación colombiana.</p>
                          {validationErrors.consentimientoDatos && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoDatos}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="aceptaImagenes"
                            type="checkbox"
                            checked={parsedData.consentimientoInformado?.aceptaImagenes || false}
                            onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaImagenes', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="aceptaImagenes" className="font-medium text-gray-700">
                            Uso de Imágenes y Fotografías
                          </label>
                          <p className="text-gray-500">Acepto el uso de imágenes y fotografías para fines médicos y académicos (opcional).</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Contacto de Emergencia</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="nombreContacto" className="block text-sm font-medium leading-6 text-gray-900">
                        Nombre del Contacto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombreContacto"
                        value={parsedData.contactoEmergencia?.nombreContacto || ''}
                        onChange={(e) => handleNestedInputChange('contactoEmergencia', 'nombreContacto', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.nombreContactoEmergencia ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                        placeholder="Nombre completo del contacto de emergencia"
                      />
                      {validationErrors.nombreContactoEmergencia && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.nombreContactoEmergencia}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="relacion" className="block text-sm font-medium leading-6 text-gray-900">
                        Relación <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="relacion"
                        value={parsedData.contactoEmergencia?.relacion || ''}
                        onChange={(e) => handleNestedInputChange('contactoEmergencia', 'relacion', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          validationErrors.relacionContactoEmergencia ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="PADRE">Padre</option>
                        <option value="MADRE">Madre</option>
                        <option value="HIJO">Hijo/Hija</option>
                        <option value="HERMANO">Hermano/Hermana</option>
                        <option value="ESPOSO">Esposo/Esposa</option>
                        <option value="CONYUGE">Cónyuge</option>
                        <option value="ABUELO">Abuelo/Abuela</option>
                        <option value="TIO">Tío/Tía</option>
                        <option value="PRIMO">Primo/Prima</option>
                        <option value="AMIGO">Amigo/Amiga</option>
                        <option value="VECINO">Vecino/Vecina</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {validationErrors.relacionContactoEmergencia && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.relacionContactoEmergencia}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="telefonoContacto" className="block text-sm font-medium leading-6 text-gray-900">
                        Teléfono Principal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefonoContacto"
                        value={parsedData.contactoEmergencia?.telefonoContacto || ''}
                        onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefonoContacto', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.telefonoContactoEmergencia ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                        placeholder="Teléfono principal del contacto"
                      />
                      {validationErrors.telefonoContactoEmergencia && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.telefonoContactoEmergencia}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="telefonoContactoSecundario" className="block text-sm font-medium leading-6 text-gray-900">
                        Teléfono Secundario
                      </label>
                      <input
                        type="tel"
                        id="telefonoContactoSecundario"
                        value={parsedData.contactoEmergencia?.telefonoContactoSecundario || ''}
                        onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefonoContactoSecundario', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Teléfono alternativo (opcional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold leading-6 text-gray-900 px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : (editingPatient ? 'Actualizar Paciente' : 'Crear Paciente')}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePatientModal;