// Validation utilities for patient forms
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

// Individual field validation functions
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es requerido`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return 'El correo electrónico no es válido';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
    return 'El formato del teléfono no es válido';
  }
  return null;
};

export const validateDate = (dateString) => {
  if (!dateString) return 'La fecha es requerida';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'La fecha no es válida';
  }

  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return 'La fecha no puede ser futura';
  }

  // Check if person is not too old (reasonable age limit)
  const age = today.getFullYear() - date.getFullYear();
  if (age > 150) {
    return 'La fecha de nacimiento no es realista';
  }

  return null;
};

export const validateDocumentNumber = (documentNumber, documentType) => {
  if (!documentNumber || !documentNumber.trim()) {
    return 'El número de documento es requerido';
  }

  // Basic validation based on document type
  switch (documentType) {
    case 'CC':
      if (!/^\d{6,10}$/.test(documentNumber)) {
        return 'La cédula de ciudadanía debe tener entre 6 y 10 dígitos';
      }
      break;
    case 'TI':
      if (!/^\d{10,11}$/.test(documentNumber)) {
        return 'La tarjeta de identidad debe tener 10 u 11 dígitos';
      }
      break;
    case 'RC':
      if (!/^\d{10,11}$/.test(documentNumber)) {
        return 'El registro civil debe tener 10 u 11 dígitos';
      }
      break;
    case 'PA':
    case 'CE':
      // For passport and foreigner ID, allow alphanumeric
      if (documentNumber.length < 5 || documentNumber.length > 20) {
        return 'El documento debe tener entre 5 y 20 caracteres';
      }
      break;
    default:
      return 'Tipo de documento no válido';
  }

  return null;
};