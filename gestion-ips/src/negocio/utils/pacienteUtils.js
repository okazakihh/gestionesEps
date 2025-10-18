/**
 * pacienteUtils.js - Funciones utilitarias para gestión de pacientes
 * 
 * Funciones puras para formateo, validación y transformación de datos de pacientes.
 */

/**
 * Parsea JSON de manera segura
 * @param {string} jsonString - String JSON a parsear
 * @returns {Object} - Objeto parseado o objeto vacío
 */
export const parseJsonSafely = (jsonString) => {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
  }
};

/**
 * Obtiene estructura de datos vacía para un nuevo paciente
 * @returns {Object} - Objeto con estructura completa de paciente
 */
export const getEmptyPacienteData = () => ({
  informacionPersonal: {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    genero: '',
    estadoCivil: '',
    nacionalidad: '',
    telefonoMovil: '',
    estratoSocioeconomico: '',
    nivelEducativo: '',
    ocupacion: '',
    tipoSangre: '',
  },
  informacionContacto: {
    email: '',
    direccion: '',
    pais: 'Colombia',
    departamento: '',
    ciudad: '',
    telefonoFijo: '',
  },
  informacionMedica: {
    eps: '',
    regimenAfiliacion: '',
    tipoPoblacion: '',
    alergias: '',
    medicamentosActuales: '',
    antecedentesPersonales: '',
    antecedentesFamiliares: '',
    enfermedadesCronicas: '',
    vacunas: '',
    observacionesMedicas: '',
  },
  consentimientoInformado: {
    aceptaTratamiento: false,
    aceptaPrivacidad: false,
    aceptaDatosPersonales: false,
    aceptaImagenes: false,
  },
  contactoEmergencia: {
    nombreContacto: '',
    relacion: '',
    telefonoContacto: '',
  },
});

/**
 * Formatea los datos del paciente para enviar al API
 * @param {Object} formData - Datos del formulario
 * @param {Object} parsedData - Datos parseados del formulario
 * @returns {Object} - Datos formateados para el API
 */
export const formatPacienteForAPI = (formData, parsedData) => {
  const datosJson = {
    informacionPersonal: parsedData.informacionPersonal || {},
    informacionContacto: parsedData.informacionContacto || {},
    informacionMedica: parsedData.informacionMedica || {},
    consentimientoInformado: parsedData.consentimientoInformado || {},
    contactoEmergencia: parsedData.contactoEmergencia || {},
  };

  return {
    numeroDocumento: formData.numeroDocumento,
    tipoDocumento: formData.tipoDocumento,
    datosJson: JSON.stringify(datosJson),
  };
};

/**
 * Valida los datos del formulario de paciente
 * @param {Object} formData - Datos del formulario principal
 * @param {Object} parsedData - Datos parseados del formulario
 * @returns {Object} - Objeto con errores de validación
 */
export const validatePacienteForm = (formData, parsedData) => {
  const errors = {};

  // Validar número de documento
  if (!formData.numeroDocumento || formData.numeroDocumento.trim() === '') {
    errors.numeroDocumento = 'El número de documento es requerido';
  }

  // Validar información personal
  const infoPersonal = parsedData.informacionPersonal || {};
  
  if (!infoPersonal.primerNombre || infoPersonal.primerNombre.trim() === '') {
    errors.primerNombre = 'El primer nombre es requerido';
  }

  if (!infoPersonal.primerApellido || infoPersonal.primerApellido.trim() === '') {
    errors.primerApellido = 'El primer apellido es requerido';
  }

  if (!infoPersonal.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
  }

  if (!infoPersonal.genero) {
    errors.genero = 'El género es requerido';
  }

  // Validar email si está presente
  const email = parsedData.informacionContacto?.email;
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'El formato del correo electrónico no es válido';
    }
  }

  // Validar información médica
  const infoMedica = parsedData.informacionMedica || {};
  
  if (!infoMedica.eps || infoMedica.eps.trim() === '') {
    errors.eps = 'La EPS es requerida';
  }

  if (!infoMedica.regimenAfiliacion || infoMedica.regimenAfiliacion.trim() === '') {
    errors.regimenAfiliacion = 'El régimen de afiliación es requerido';
  }

  // Validar consentimientos
  const consentimiento = parsedData.consentimientoInformado || {};
  
  if (!consentimiento.aceptaTratamiento) {
    errors.consentimientoTratamiento = 'Debe aceptar el tratamiento médico';
  }

  if (!consentimiento.aceptaPrivacidad) {
    errors.consentimientoPrivacidad = 'Debe aceptar la protección de datos personales';
  }

  if (!consentimiento.aceptaDatosPersonales) {
    errors.consentimientoDatos = 'Debe aceptar el tratamiento de datos sensibles';
  }

  // Validar contacto de emergencia
  const contactoEmergencia = parsedData.contactoEmergencia || {};
  
  if (!contactoEmergencia.nombreContacto || contactoEmergencia.nombreContacto.trim() === '') {
    errors.nombreContactoEmergencia = 'El nombre del contacto de emergencia es requerido';
  }

  if (!contactoEmergencia.telefonoContacto || contactoEmergencia.telefonoContacto.trim() === '') {
    errors.telefonoContactoEmergencia = 'El teléfono del contacto de emergencia es requerido';
  }

  return errors;
};

/**
 * Parsea la fecha del backend (formato array) a string ISO
 * @param {Array|string} dateValue - Fecha en formato array o string
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const parseDateFromBackend = (dateValue) => {
  if (!dateValue) return '';
  
  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  if (typeof dateValue === 'string') {
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    return dateValue;
  }
  
  return '';
};

/**
 * Parsea los datos de un paciente desde el backend
 * @param {Object} paciente - Datos del paciente desde el backend
 * @returns {Object} - Datos parseados para el formulario
 */
export const parsePacienteFromBackend = (paciente) => {
  if (!paciente) return null;

  let datosJson = {};
  
  // Intentar parsear datosJson
  if (paciente.datosJson) {
    if (typeof paciente.datosJson === 'string') {
      try {
        datosJson = JSON.parse(paciente.datosJson);
      } catch (error) {
        console.error('Error parsing datosJson:', error);
      }
    } else {
      datosJson = paciente.datosJson;
    }
  }

  // Buscar en diferentes niveles de anidación
  const secondLevel = datosJson.datosJson 
    ? (typeof datosJson.datosJson === 'string' ? parseJsonSafely(datosJson.datosJson) : datosJson.datosJson)
    : datosJson;

  const infoPersonal = secondLevel.informacionPersonal || datosJson.informacionPersonal || {};
  const infoContacto = secondLevel.informacionContacto || datosJson.informacionContacto || {};
  const infoMedica = secondLevel.informacionMedica || datosJson.informacionMedica || {};
  const consentimiento = secondLevel.consentimientoInformado || datosJson.consentimientoInformado || {};
  const contactoEmergencia = secondLevel.contactoEmergencia || datosJson.contactoEmergencia || {};

  return {
    tipoDocumento: paciente.tipoDocumento || 'CC',
    numeroDocumento: paciente.numeroDocumento || '',
    informacionPersonal: {
      primerNombre: infoPersonal.primerNombre || '',
      segundoNombre: infoPersonal.segundoNombre || '',
      primerApellido: infoPersonal.primerApellido || '',
      segundoApellido: infoPersonal.segundoApellido || '',
      fechaNacimiento: parseDateFromBackend(infoPersonal.fechaNacimiento),
      genero: infoPersonal.genero || '',
      estadoCivil: infoPersonal.estadoCivil || '',
      nacionalidad: infoPersonal.nacionalidad || '',
      telefonoMovil: infoPersonal.telefonoMovil || '',
      estratoSocioeconomico: infoPersonal.estratoSocioeconomico || '',
      nivelEducativo: infoPersonal.nivelEducativo || '',
      ocupacion: infoPersonal.ocupacion || '',
      tipoSangre: infoPersonal.tipoSangre || '',
    },
    informacionContacto: {
      email: infoContacto.email || '',
      direccion: infoContacto.direccion || '',
      pais: infoContacto.pais || 'Colombia',
      departamento: infoContacto.departamento || '',
      ciudad: infoContacto.ciudad || '',
      telefonoFijo: infoContacto.telefonoFijo || '',
    },
    informacionMedica: {
      eps: infoMedica.eps || '',
      regimenAfiliacion: infoMedica.regimenAfiliacion || '',
      tipoPoblacion: infoMedica.tipoPoblacion || '',
      alergias: infoMedica.alergias || '',
      medicamentosActuales: infoMedica.medicamentosActuales || '',
      antecedentesPersonales: infoMedica.antecedentesPersonales || '',
      antecedentesFamiliares: infoMedica.antecedentesFamiliares || '',
      enfermedadesCronicas: infoMedica.enfermedadesCronicas || '',
      vacunas: infoMedica.vacunas || '',
      observacionesMedicas: infoMedica.observacionesMedicas || '',
    },
    consentimientoInformado: {
      aceptaTratamiento: consentimiento.aceptaTratamiento || false,
      aceptaPrivacidad: consentimiento.aceptaPrivacidad || false,
      aceptaDatosPersonales: consentimiento.aceptaDatosPersonales || false,
      aceptaImagenes: consentimiento.aceptaImagenes || false,
    },
    contactoEmergencia: {
      nombreContacto: contactoEmergencia.nombreContacto || '',
      relacion: contactoEmergencia.relacion || '',
      telefonoContacto: contactoEmergencia.telefonoContacto || '',
    },
  };
};

/**
 * Obtiene el nombre completo de un paciente
 * @param {Object} paciente - Datos del paciente
 * @returns {string} - Nombre completo
 */
export const getNombreCompletoPaciente = (paciente) => {
  if (!paciente) return 'N/A';
  
  const nombres = [
    paciente.informacionPersonal?.primerNombre,
    paciente.informacionPersonal?.segundoNombre,
    paciente.informacionPersonal?.primerApellido,
    paciente.informacionPersonal?.segundoApellido,
  ].filter(Boolean).join(' ');
  
  return nombres || 'N/A';
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param {string} fechaNacimiento - Fecha en formato YYYY-MM-DD
 * @returns {number|null} - Edad en años
 */
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};
