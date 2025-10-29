/**
 * Validadores para formularios de empleado
 */

/**
 * Verifica si el formulario tiene todos los campos obligatorios completos
 * @param {Object} formData - Datos del formulario
 * @returns {boolean} True si todos los campos obligatorios están llenos
 */
export const isFormComplete = (formData) => {
  // Campos obligatorios básicos
  if (!formData.numeroDocumento || !formData.tipoDocumento) return false;
  if (!formData.primerNombre || !formData.primerApellido) return false;
  if (!formData.fechaNacimiento || !formData.genero) return false;
  if (!formData.telefono || !formData.email || !formData.direccion) return false;
  if (!formData.tipoPersonal || !formData.fechaIngreso) return false;

  // Validaciones condicionales según tipo de personal
  if (formData.tipoPersonal === 'MEDICO') {
    if (!formData.numeroLicencia || !formData.especialidad) return false;
  }

  if (formData.tipoPersonal === 'ADMINISTRATIVO') {
    if (!formData.cargo) return false;
  }

  return true;
};

/**
 * Valida que los campos requeridos estén completos y retorna mensaje de error
 * @param {Object} formData - Datos del formulario
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateEmpleadoForm = (formData) => {
  // Validaciones básicas
  if (!formData.numeroDocumento) return 'El número de documento es obligatorio';
  if (!formData.tipoDocumento) return 'El tipo de documento es obligatorio';
  if (!formData.primerNombre) return 'El primer nombre es obligatorio';
  if (!formData.primerApellido) return 'El primer apellido es obligatorio';
  if (!formData.fechaNacimiento) return 'La fecha de nacimiento es obligatoria';
  if (!formData.genero) return 'El género es obligatorio';
  if (!formData.telefono) return 'El teléfono es obligatorio';
  if (!formData.email) return 'El email es obligatorio';
  if (!formData.direccion) return 'La dirección es obligatoria';
  if (!formData.tipoPersonal) return 'El tipo de personal es obligatorio';
  if (!formData.fechaIngreso) return 'La fecha de ingreso es obligatoria';

  // Validaciones condicionales según tipo de personal
  if (formData.tipoPersonal === 'MEDICO') {
    if (!formData.numeroLicencia) return 'El número de licencia es obligatorio para médicos';
    if (!formData.especialidad) return 'La especialidad es obligatoria para médicos';
  }

  if (formData.tipoPersonal === 'ADMINISTRATIVO') {
    if (!formData.cargo) return 'El cargo es obligatorio para personal administrativo';
  }

  return null;
};

/**
 * Obtiene el estado inicial del formulario
 * @returns {Object} Formulario inicial
 */
export const getInitialFormData = () => ({
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
  pais: 'Colombia',
  tipoPersonal: '',
  tipoMedico: '',
  especialidad: '',
  dependencia: '',
  cargo: '',
  salario: '',
  fechaIngreso: '',
  numeroLicencia: '',
  fechaContratacion: '',
  tipoContrato: 'INDEFINIDO'
});

/**
 * Mapea datos de empleado a formato de usuario
 * @param {Object} empleado - Objeto empleado
 * @param {Object} parsedData - Datos parseados del empleado
 * @returns {Object} Datos en formato de usuario
 */
export const mapEmpleadoToUserData = (empleado, parsedData) => {
  const { informacionPersonal, informacionContacto, informacionLaboral, numeroDocumento, tipoDocumento } = parsedData;

  // Generar username sugerido del email (parte antes del @)
  const suggestedUsername = informacionContacto.email ? 
    informacionContacto.email.split('@')[0] : 
    `${informacionPersonal.primerNombre || ''}${informacionPersonal.primerApellido || ''}`.toLowerCase().replace(/\s+/g, '');

  return {
    username: suggestedUsername,
    email: informacionContacto.email || '',
    password: '', // Usuario debe ingresar password
    nombres: informacionPersonal.primerNombre || '',
    apellidos: `${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim(),
    documento: numeroDocumento || '',
    tipoDocumento: tipoDocumento || 'CC',
    fechaNacimiento: informacionPersonal.fechaNacimiento || '',
    genero: informacionPersonal.genero === 'MASCULINO' ? 'M' : informacionPersonal.genero === 'FEMENINO' ? 'F' : 'O',
    telefono: informacionContacto.telefono || '',
    direccion: informacionContacto.direccion || '',
    ciudad: informacionContacto.ciudad || '',
    departamento: informacionContacto.departamento || '',
    pais: informacionContacto.pais || 'COLOMBIA',
    codigoPostal: '',
    rol: informacionLaboral.tipoPersonal === 'MEDICO' ? 'DOCTOR' :
         informacionLaboral.tipoPersonal === 'ADMINISTRATIVO' ? 'ADMINISTRATIVO' : 'ADMINISTRATIVO'
  };
};
