/**
 * Utilidades para parsear y extraer información de empleados
 * Maneja el doble JSON anidado del backend
 */

/**
 * Parsea el JSON completo del empleado
 * @param {Object} empleado - Objeto empleado con jsonData
 * @returns {Object} Datos parseados con estructura plana
 */
export const parseEmpleadoData = (empleado) => {
  const result = {
    numeroDocumento: '',
    tipoDocumento: '',
    informacionPersonal: {},
    informacionContacto: {},
    informacionLaboral: {},
    activo: empleado?.activo ?? true,
    fechaCreacion: empleado?.fechaCreacion || null
  };

  try {
    if (!empleado || !empleado.jsonData) {
      return result;
    }

    const datosCompletos = JSON.parse(empleado.jsonData || '{}');
    result.numeroDocumento = datosCompletos.numeroDocumento || '';
    result.tipoDocumento = datosCompletos.tipoDocumento || '';

    if (datosCompletos.jsonData) {
      const datosInternos = JSON.parse(datosCompletos.jsonData);
      result.informacionPersonal = datosInternos.informacionPersonal || {};
      result.informacionContacto = datosInternos.informacionContacto || {};
      result.informacionLaboral = datosInternos.informacionLaboral || {};
    }
  } catch (error) {
    console.error('Error parsing empleado data:', error);
  }

  return result;
};

/**
 * Extrae información personal del empleado
 * @param {Object} empleado - Objeto empleado
 * @returns {Object} Información personal
 */
export const getEmpleadoPersonalInfo = (empleado) => {
  const parsed = parseEmpleadoData(empleado);
  return {
    primerNombre: parsed.informacionPersonal.primerNombre || '',
    segundoNombre: parsed.informacionPersonal.segundoNombre || '',
    primerApellido: parsed.informacionPersonal.primerApellido || '',
    segundoApellido: parsed.informacionPersonal.segundoApellido || '',
    fechaNacimiento: parsed.informacionPersonal.fechaNacimiento || '',
    genero: parsed.informacionPersonal.genero || ''
  };
};

/**
 * Extrae información de contacto del empleado
 * @param {Object} empleado - Objeto empleado
 * @returns {Object} Información de contacto
 */
export const getEmpleadoContactInfo = (empleado) => {
  const parsed = parseEmpleadoData(empleado);
  return {
    telefono: parsed.informacionContacto.telefono || '',
    email: parsed.informacionContacto.email || '',
    direccion: parsed.informacionContacto.direccion || '',
    ciudad: parsed.informacionContacto.ciudad || '',
    departamento: parsed.informacionContacto.departamento || '',
    pais: parsed.informacionContacto.pais || 'Colombia'
  };
};

/**
 * Extrae información laboral del empleado
 * @param {Object} empleado - Objeto empleado
 * @returns {Object} Información laboral
 */
export const getEmpleadoLaboralInfo = (empleado) => {
  const parsed = parseEmpleadoData(empleado);
  return {
    tipoPersonal: parsed.informacionLaboral.tipoPersonal || '',
    tipoMedico: parsed.informacionLaboral.tipoMedico || '',
    especialidad: parsed.informacionLaboral.especialidad || '',
    dependencia: parsed.informacionLaboral.dependencia || '',
    cargo: parsed.informacionLaboral.cargo || '',
    salario: parsed.informacionLaboral.salario || '',
    fechaIngreso: parsed.informacionLaboral.fechaIngreso || '',
    numeroLicencia: parsed.informacionLaboral.numeroLicencia || '',
    fechaContratacion: parsed.informacionLaboral.fechaContratacion || '',
    tipoContrato: parsed.informacionLaboral.tipoContrato || 'INDEFINIDO'
  };
};

/**
 * Obtiene el nombre completo del empleado
 * @param {Object} empleado - Objeto empleado
 * @returns {string} Nombre completo
 */
export const getEmpleadoNombreCompleto = (empleado) => {
  const personal = getEmpleadoPersonalInfo(empleado);
  return `${personal.primerNombre} ${personal.segundoNombre} ${personal.primerApellido} ${personal.segundoApellido}`.trim();
};

/**
 * Construye el JSON para enviar al backend
 * @param {Object} formData - Datos del formulario
 * @param {boolean} activo - Estado activo del empleado
 * @returns {string} JSON string para enviar
 */
export const buildEmpleadoJSON = (formData, activo = true) => {
  const datosInternosJson = JSON.stringify({
    informacionPersonal: {
      primerNombre: formData.primerNombre,
      segundoNombre: formData.segundoNombre,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido,
      fechaNacimiento: formData.fechaNacimiento,
      genero: formData.genero
    },
    informacionContacto: {
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      departamento: formData.departamento,
      pais: formData.pais
    },
    informacionLaboral: {
      tipoPersonal: formData.tipoPersonal,
      tipoMedico: formData.tipoPersonal === 'MEDICO' ? formData.tipoMedico : null,
      especialidad: formData.tipoPersonal === 'MEDICO' ? formData.especialidad : null,
      numeroLicencia: formData.tipoPersonal === 'MEDICO' ? formData.numeroLicencia : null,
      dependencia: formData.tipoPersonal === 'ADMINISTRATIVO' ? formData.dependencia : null,
      cargo: formData.cargo,
      salario: formData.salario,
      fechaIngreso: formData.fechaIngreso,
      fechaContratacion: formData.fechaContratacion,
      tipoContrato: formData.tipoContrato
    }
  });

  const datosCompletosJson = JSON.stringify({
    numeroDocumento: formData.numeroDocumento,
    tipoDocumento: formData.tipoDocumento,
    jsonData: datosInternosJson,
    activo: activo
  });

  return datosCompletosJson;
};

/**
 * Extrae información para búsqueda
 * @param {Object} empleado - Objeto empleado
 * @returns {Object} Información searchable
 */
export const getEmpleadoSearchableData = (empleado) => {
  const parsed = parseEmpleadoData(empleado);
  return {
    numeroDocumento: parsed.numeroDocumento,
    primerNombre: parsed.informacionPersonal.primerNombre || '',
    primerApellido: parsed.informacionPersonal.primerApellido || '',
    cargo: parsed.informacionLaboral.cargo || '',
    telefono: parsed.informacionContacto.telefono || '',
    email: parsed.informacionContacto.email || ''
  };
};
