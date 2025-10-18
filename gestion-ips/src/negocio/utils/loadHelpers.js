// ============================================
// DATOS PERSONALES
// ============================================

export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'NIT' }
];

export const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
];

export const ESTADOS_CIVILES = [
  { value: 'SOLTERO', label: 'Soltero' },
  { value: 'CASADO', label: 'Casado' },
  { value: 'DIVORCIADO', label: 'Divorciado' },
  { value: 'VIUDO', label: 'Viudo' },
  { value: 'UNION_LIBRE', label: 'Unión Libre' },
  { value: 'SEPARADO', label: 'Separado' }
];

export const ESTRATOS_SOCIOECONOMICOS = [
  { value: '1', label: 'Estrato 1' },
  { value: '2', label: 'Estrato 2' },
  { value: '3', label: 'Estrato 3' },
  { value: '4', label: 'Estrato 4' },
  { value: '5', label: 'Estrato 5' },
  { value: '6', label: 'Estrato 6' }
];

export const NIVELES_EDUCATIVOS = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'PREESCOLAR', label: 'Preescolar' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'TECNOLOGICO', label: 'Tecnológico' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'ESPECIALIZACION', label: 'Especialización' },
  { value: 'MAESTRIA', label: 'Maestría' },
  { value: 'DOCTORADO', label: 'Doctorado' }
];

// ============================================
// DATOS LABORALES
// ============================================

export const TIPOS_PERSONAL = [
  { value: 'MEDICO', label: 'Personal Médico' },
  { value: 'ADMINISTRATIVO', label: 'Personal Administrativo' }
];

export const TIPOS_MEDICO = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'AUXILIAR', label: 'Auxiliar' }
];

export const TIPOS_SANGRE = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

// ============================================
// DATOS DE SALUD
// ============================================

export const REGIMENES_AFILIACION = [
  { value: 'CONTRIBUTIVO', label: 'Contributivo' },
  { value: 'SUBSIDIADO', label: 'Subsidiado' },
  { value: 'ESPECIAL', label: 'Especial' },
  { value: 'EXCEPTUADO', label: 'Exceptuado' },
  { value: 'NO_AFILIADO', label: 'No Afiliado' }
];

export const TIPOS_POBLACION = [
  { value: 'GENERAL', label: 'General' },
  { value: 'DESPLAZADO', label: 'Desplazado' },
  { value: 'INDIGENA', label: 'Indígena' },
  { value: 'ROM', label: 'ROM (Gitano)' },
  { value: 'RAIZAL', label: 'Raizal' },
  { value: 'PALENQUERO', label: 'Palenquero' },
  { value: 'AFRODESCENDIENTE', label: 'Afrodescendiente' },
  { value: 'VICTIMA_CONFLICTO', label: 'Víctima del Conflicto' },
  { value: 'DISCAPACITADO', label: 'Persona con Discapacidad' }
];

export const ESTADOS_CITA = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'EN_CURSO', label: 'En Curso' },
  { value: 'ATENDIDA', label: 'Atendida' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'NO_ASISTIO', label: 'No Asistió' },
  { value: 'REPROGRAMADA', label: 'Reprogramada' }
];

export const TIPOS_CONSULTA = [
  { value: 'PRIMERA_VEZ', label: 'Primera Vez' },
  { value: 'CONTROL', label: 'Control' },
  { value: 'URGENCIA', label: 'Urgencia' },
  { value: 'ESPECIALIZADA', label: 'Especializada' }
];

export const ESPECIALIDADES_MEDICAS = [
  { value: 'MEDICINA_GENERAL', label: 'Medicina General' },
  { value: 'PEDIATRIA', label: 'Pediatría' },
  { value: 'GINECOLOGIA', label: 'Ginecología' },
  { value: 'CARDIOLOGIA', label: 'Cardiología' },
  { value: 'DERMATOLOGIA', label: 'Dermatología' },
  { value: 'NEUROLOGIA', label: 'Neurología' },
  { value: 'PSIQUIATRIA', label: 'Psiquiatría' },
  { value: 'OFTALMOLOGIA', label: 'Oftalmología' },
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
  { value: 'ODONTOLOGIA', label: 'Odontología' },
  { value: 'PSICOLOGIA', label: 'Psicología' },
  { value: 'FISIOTERAPIA', label: 'Fisioterapia' },
  { value: 'NUTRICION', label: 'Nutrición' },
  { value: 'OTORRINOLARINGOLOGIA', label: 'Otorrinolaringología' },
  { value: 'UROLOGIA', label: 'Urología' },
  { value: 'GASTROENTEROLOGIA', label: 'Gastroenterología' },
  { value: 'ENDOCRINOLOGIA', label: 'Endocrinología' },
  { value: 'NEUMOLOGIA', label: 'Neumología' },
  { value: 'NEFROLOGIA', label: 'Nefrología' },
  { value: 'REUMATOLOGIA', label: 'Reumatología' }
];

// ============================================
// RECURSOS HUMANOS
// ============================================

export const ROLES_SISTEMA = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'AUXILIAR_ADMINISTRATIVO', label: 'Auxiliar Administrativo' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'AUXILIAR_MEDICO', label: 'Auxiliar Médico' }
];

export const TIPOS_CONTRATO = [
  { value: 'INDEFINIDO', label: 'Indefinido' },
  { value: 'FIJO', label: 'Término Fijo' },
  { value: 'OBRA_LABOR', label: 'Obra o Labor' },
  { value: 'PRESTACION_SERVICIOS', label: 'Prestación de Servicios' },
  { value: 'APRENDIZAJE', label: 'Aprendizaje' },
  { value: 'TEMPORAL', label: 'Temporal' }
];

export const ESTADOS_EMPLEADO = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'VACACIONES', label: 'Vacaciones' },
  { value: 'INCAPACIDAD', label: 'Incapacidad' },
  { value: 'LICENCIA', label: 'Licencia' },
  { value: 'RETIRADO', label: 'Retirado' }
];

// ============================================
// FACTURACIÓN
// ============================================

export const ESTADOS_FACTURA = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADA', label: 'Pagada' },
  { value: 'ANULADA', label: 'Anulada' },
  { value: 'VENCIDA', label: 'Vencida' }
];

export const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'PSE', label: 'PSE' },
  { value: 'OTRO', label: 'Otro' }
];

// ============================================
// GEOGRAFÍA (COLOMBIA)
// ============================================

// ============================================
// GEOGRAFÍA (con respaldo estático para compatibilidad)
// ============================================

// NOTA: Se recomienda usar geografiaApiService para datos actualizados desde APIs
// Estas constantes son solo para respaldo/compatibilidad con código existente

export const DEPARTAMENTOS_COLOMBIA = [
  { value: 'AMAZONAS', label: 'Amazonas' },
  { value: 'ANTIOQUIA', label: 'Antioquia' },
  { value: 'ARAUCA', label: 'Arauca' },
  { value: 'ATLANTICO', label: 'Atlántico' },
  { value: 'BOLIVAR', label: 'Bolívar' },
  { value: 'BOYACA', label: 'Boyacá' },
  { value: 'CALDAS', label: 'Caldas' },
  { value: 'CAQUETA', label: 'Caquetá' },
  { value: 'CASANARE', label: 'Casanare' },
  { value: 'CAUCA', label: 'Cauca' },
  { value: 'CESAR', label: 'Cesar' },
  { value: 'CHOCO', label: 'Chocó' },
  { value: 'CORDOBA', label: 'Córdoba' },
  { value: 'CUNDINAMARCA', label: 'Cundinamarca' },
  { value: 'GUAINIA', label: 'Guainía' },
  { value: 'GUAVIARE', label: 'Guaviare' },
  { value: 'HUILA', label: 'Huila' },
  { value: 'LA_GUAJIRA', label: 'La Guajira' },
  { value: 'MAGDALENA', label: 'Magdalena' },
  { value: 'META', label: 'Meta' },
  { value: 'NARINO', label: 'Nariño' },
  { value: 'NORTE_SANTANDER', label: 'Norte de Santander' },
  { value: 'PUTUMAYO', label: 'Putumayo' },
  { value: 'QUINDIO', label: 'Quindío' },
  { value: 'RISARALDA', label: 'Risaralda' },
  { value: 'SAN_ANDRES', label: 'San Andrés y Providencia' },
  { value: 'SANTANDER', label: 'Santander' },
  { value: 'SUCRE', label: 'Sucre' },
  { value: 'TOLIMA', label: 'Tolima' },
  { value: 'VALLE_DEL_CAUCA', label: 'Valle del Cauca' },
  { value: 'VAUPES', label: 'Vaupés' },
  { value: 'VICHADA', label: 'Vichada' },
  { value: 'BOGOTA', label: 'Bogotá D.C.' }
];

// ============================================
// UTILIDADES GENERALES
// ============================================

export const DIAS_SEMANA = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

export const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

export const HORAS_DIA = [
  { value: '00', label: '00:00' },
  { value: '01', label: '01:00' },
  { value: '02', label: '02:00' },
  { value: '03', label: '03:00' },
  { value: '04', label: '04:00' },
  { value: '05', label: '05:00' },
  { value: '06', label: '06:00' },
  { value: '07', label: '07:00' },
  { value: '08', label: '08:00' },
  { value: '09', label: '09:00' },
  { value: '10', label: '10:00' },
  { value: '11', label: '11:00' },
  { value: '12', label: '12:00' },
  { value: '13', label: '13:00' },
  { value: '14', label: '14:00' },
  { value: '15', label: '15:00' },
  { value: '16', label: '16:00' },
  { value: '17', label: '17:00' },
  { value: '18', label: '18:00' },
  { value: '19', label: '19:00' },
  { value: '20', label: '20:00' },
  { value: '21', label: '21:00' },
  { value: '22', label: '22:00' },
  { value: '23', label: '23:00' }
];

export const MINUTOS_15 = [
  { value: '00', label: '00' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' }
];

export const DURACIONES_CONSULTA = [
  { value: '15', label: '15 minutos' },
  { value: '20', label: '20 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora 30 minutos' },
  { value: '120', label: '2 horas' }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene el label de un value dado
 * @param {Array} options - Array de opciones {value, label}
 * @param {string} value - Valor a buscar
 * @returns {string} Label correspondiente o el value si no se encuentra
 */
export const getLabelByValue = (options, value) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

/**
 * Filtra opciones por texto de búsqueda
 * @param {Array} options - Array de opciones {value, label}
 * @param {string} searchText - Texto de búsqueda
 * @returns {Array} Opciones filtradas
 */
export const filterOptions = (options, searchText) => {
  if (!searchText) return options;
  const search = searchText.toLowerCase();
  return options.filter(opt => 
    opt.label.toLowerCase().includes(search) || 
    opt.value.toLowerCase().includes(search)
  );
};

/**
 * Convierte opciones al formato requerido por react-select
 * @param {Array} options - Array de opciones {value, label}
 * @returns {Array} Opciones en formato react-select
 */
export const toReactSelectFormat = (options) => {
  return options.map(opt => ({
    value: opt.value,
    label: opt.label
  }));
};

/**
 * Agrupa opciones por categoría
 * @param {Array} options - Array de opciones {value, label, category}
 * @returns {Object} Opciones agrupadas por categoría
 */
export const groupOptions = (options) => {
  return options.reduce((acc, opt) => {
    const category = opt.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(opt);
    return acc;
  }, {});
};

/**
 * Genera opciones numéricas en un rango
 * @param {number} start - Número inicial
 * @param {number} end - Número final
 * @param {string} prefix - Prefijo para el label (opcional)
 * @param {string} suffix - Sufijo para el label (opcional)
 * @returns {Array} Opciones numéricas
 */
export const generateNumericOptions = (start, end, prefix = '', suffix = '') => {
  const options = [];
  for (let i = start; i <= end; i++) {
    options.push({
      value: String(i),
      label: `${prefix}${i}${suffix}`
    });
  }
  return options;
};
