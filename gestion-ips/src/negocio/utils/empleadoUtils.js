/**
 * Utilidades para parseo y manejo de datos de empleados
 */

/**
 * Parsea el JSON completo de un empleado
 * @param {string} jsonData - JSON string del empleado
 * @returns {Object} Objeto con todos los datos parseados
 */
export const parseEmpleadoData = (jsonData) => {
  const defaultData = {
    datosCompletos: {},
    numeroDocumento: 'N/A',
    tipoDocumento: '',
    informacionPersonal: {},
    informacionContacto: {},
    informacionLaboral: {}
  };

  try {
    const datosCompletos = JSON.parse(jsonData || '{}');
    const numeroDocumento = datosCompletos.numeroDocumento || 'N/A';
    const tipoDocumento = datosCompletos.tipoDocumento || '';

    let informacionPersonal = {};
    let informacionContacto = {};
    let informacionLaboral = {};

    if (datosCompletos.jsonData) {
      const datosInternos = JSON.parse(datosCompletos.jsonData);
      informacionPersonal = datosInternos.informacionPersonal || {};
      informacionContacto = datosInternos.informacionContacto || {};
      informacionLaboral = datosInternos.informacionLaboral || {};
    }

    return {
      datosCompletos,
      numeroDocumento,
      tipoDocumento,
      informacionPersonal,
      informacionContacto,
      informacionLaboral
    };
  } catch (error) {
    console.error('Error parsing empleado data:', error);
    return defaultData;
  }
};

/**
 * Obtiene el nombre completo del empleado
 * @param {Object} informacionPersonal - Información personal del empleado
 * @returns {string} Nombre completo
 */
export const getNombreCompleto = (informacionPersonal) => {
  return `${informacionPersonal.primerNombre || ''} ${informacionPersonal.segundoNombre || ''} ${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim();
};

/**
 * Formatea los datos del empleado para enviar al API (crear/actualizar)
 * @param {Object} formData - Datos del formulario
 * @param {boolean} activo - Estado del empleado (opcional, para actualización)
 * @returns {string} JSON string listo para enviar al API
 */
export const formatEmpleadoForAPI = (formData, activo = true) => {
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
      dependencia: formData.tipoPersonal === 'ADMINISTRATIVO' ? formData.dependencia : null,
      cargo: formData.cargo,
      salario: formData.salario,
      fechaContratacion: formData.fechaContratacion,
      tipoContrato: formData.tipoContrato
    }
  });

  const datosCompletosJson = JSON.stringify({
    numeroDocumento: formData.numeroDocumento,
    tipoDocumento: formData.tipoDocumento,
    jsonData: datosInternosJson,
    activo
  });

  return datosCompletosJson;
};

/**
 * Convierte datos de empleado a formato para crear usuario
 * @param {Object} empleadoData - Datos parseados del empleado
 * @returns {Object} Datos formateados para crear usuario
 */
export const empleadoToUserData = (empleadoData) => {
  const { numeroDocumento, tipoDocumento, informacionPersonal, informacionContacto, informacionLaboral } = empleadoData;

  return {
    nombres: informacionPersonal.primerNombre || '',
    apellidos: `${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim(),
    documento: numeroDocumento,
    tipoDocumento: tipoDocumento || 'CC',
    fechaNacimiento: informacionPersonal.fechaNacimiento || '',
    genero: informacionPersonal.genero === 'MASCULINO' ? 'M' : informacionPersonal.genero === 'FEMENINO' ? 'F' : 'O',
    telefono: informacionContacto.telefono || '',
    email: informacionContacto.email || '',
    direccion: informacionContacto.direccion || '',
    ciudad: informacionContacto.ciudad || '',
    departamento: informacionContacto.departamento || '',
    pais: informacionContacto.pais || 'COLOMBIA',
    // Set default role based on employee type and tipoMedico
    rol: informacionLaboral.tipoPersonal === 'MEDICO' 
      ? (informacionLaboral.tipoMedico === 'AUXILIAR' ? 'AUXILIAR_MEDICO' : 'DOCTOR')
      : 'ADMINISTRATIVO'
  };
};

/**
 * Convierte datos parseados a formato de formulario
 * @param {Object} empleadoData - Datos parseados del empleado
 * @returns {Object} Datos formateados para el formulario
 */
export const parseEmpleadoToFormData = (empleadoData) => {
  const { numeroDocumento, tipoDocumento, informacionPersonal, informacionContacto, informacionLaboral } = empleadoData;

  // Normalizar código de país
  let paisNormalizado = informacionContacto.pais || 'CO';
  if (paisNormalizado === 'Colombia' || paisNormalizado === 'COLOMBIA') {
    paisNormalizado = 'CO';
  }

  return {
    numeroDocumento: numeroDocumento || '',
    tipoDocumento: tipoDocumento || 'CC',
    primerNombre: informacionPersonal.primerNombre || '',
    segundoNombre: informacionPersonal.segundoNombre || '',
    primerApellido: informacionPersonal.primerApellido || '',
    segundoApellido: informacionPersonal.segundoApellido || '',
    fechaNacimiento: informacionPersonal.fechaNacimiento || '',
    genero: informacionPersonal.genero || 'MASCULINO',
    telefono: informacionContacto.telefono || '',
    email: informacionContacto.email || '',
    direccion: informacionContacto.direccion || '',
    ciudad: informacionContacto.ciudad || '',
    departamento: informacionContacto.departamento || '',
    pais: paisNormalizado,
    tipoPersonal: informacionLaboral.tipoPersonal || '',
    tipoMedico: informacionLaboral.tipoMedico || '',
    especialidad: informacionLaboral.especialidad || '',
    dependencia: informacionLaboral.dependencia || '',
    cargo: informacionLaboral.cargo || '',
    salario: informacionLaboral.salario || '',
    fechaContratacion: informacionLaboral.fechaContratacion || '',
    tipoContrato: informacionLaboral.tipoContrato || 'INDEFINIDO'
  };
};

/**
 * Obtiene el formData inicial vacío
 * @returns {Object} Objeto con todos los campos del formulario vacíos
 */
export const getEmptyFormData = () => ({
  numeroDocumento: '',
  tipoDocumento: 'CC',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  fechaNacimiento: '',
  genero: 'MASCULINO',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  pais: 'CO', // Código ISO2 de Colombia por defecto
  tipoPersonal: '',
  tipoMedico: '',
  especialidad: '',
  dependencia: '',
  cargo: '',
  salario: '',
  fechaContratacion: '',
  tipoContrato: 'INDEFINIDO'
});

/**
 * Valida si el formulario de empleado es válido
 * @param {Object} formData - Datos del formulario
 * @returns {boolean} true si es válido
 */
export const validateEmpleadoForm = (formData) => {
  // Validaciones básicas
  if (!formData.numeroDocumento || !formData.primerNombre || !formData.primerApellido || 
      !formData.fechaNacimiento || !formData.telefono || !formData.tipoPersonal) {
    return false;
  }

  // Validaciones específicas para MEDICO
  if (formData.tipoPersonal === 'MEDICO') {
    if (!formData.tipoMedico || !formData.especialidad) {
      return false;
    }
  }

  // Validaciones específicas para ADMINISTRATIVO
  if (formData.tipoPersonal === 'ADMINISTRATIVO') {
    if (!formData.dependencia) {
      return false;
    }
  }

  return true;
};

/**
 * Filtra empleados según término de búsqueda
 * @param {Array} empleados - Lista de empleados
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Empleados filtrados
 */
export const filterEmpleados = (empleados, searchTerm) => {
  if (!searchTerm) return empleados;

  const searchLower = searchTerm.toLowerCase();

  return empleados.filter((empleado) => {
    const data = parseEmpleadoData(empleado.jsonData);
    const { numeroDocumento, informacionPersonal, informacionContacto, informacionLaboral } = data;

    const nombre = `${informacionPersonal.primerNombre || ''} ${informacionPersonal.primerApellido || ''}`.toLowerCase();
    const cargo = (informacionLaboral.cargo || '').toLowerCase();
    const telefono = (informacionContacto.telefono || '').toLowerCase();
    const email = (informacionContacto.email || '').toLowerCase();

    return (
      numeroDocumento.toLowerCase().includes(searchLower) ||
      nombre.includes(searchLower) ||
      cargo.includes(searchLower) ||
      telefono.includes(searchLower) ||
      email.includes(searchLower)
    );
  });
};

/**
 * Obtiene el label de tipo de personal
 * @param {string} tipoPersonal - Tipo de personal
 * @returns {string} Label formateado
 */
export const getTipoPersonalLabel = (tipoPersonal) => {
  const labels = {
    'MEDICO': 'Personal Médico',
    'ADMINISTRATIVO': 'Personal Administrativo'
  };
  return labels[tipoPersonal] || 'N/A';
};

/**
 * Obtiene el label de tipo de médico
 * @param {string} tipoMedico - Tipo de médico
 * @returns {string} Label formateado
 */
export const getTipoMedicoLabel = (tipoMedico) => {
  const labels = {
    'DOCTOR': 'Doctor',
    'AUXILIAR': 'Auxiliar'
  };
  return labels[tipoMedico] || 'N/A';
};
