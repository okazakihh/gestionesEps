// Archivo de listas de ayuda para selects del proyecto
// Contiene todas las opciones de los selects organizadas por categorías

export const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'RC', label: 'Registro Civil' }
];

export const GENERO_OPTIONS = [
  { value: 'M', label: 'Masculino/a' },
  { value: 'F', label: 'Femenino/a' },
  { value: 'O', label: 'Otro' }
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'SOLTERO', label: 'Soltero/a' },
  { value: 'CASADO', label: 'Casado/a' },
  { value: 'DIVORCIADO', label: 'Divorciado/a' },
  { value: 'VIUDO', label: 'Viudo/a' },
  { value: 'UNION_LIBRE', label: 'Unión Libre' }
];

export const ESTRATO_SOCIOECONOMICO_OPTIONS = [
  { value: '1', label: 'Estrato 1' },
  { value: '2', label: 'Estrato 2' },
  { value: '3', label: 'Estrato 3' },
  { value: '4', label: 'Estrato 4' },
  { value: '5', label: 'Estrato 5' },
  { value: '6', label: 'Estrato 6' }
];

export const NIVEL_EDUCATIVO_OPTIONS = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'TECNOLOGICO', label: 'Tecnológico' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'POSGRADO', label: 'Posgrado' }
];

export const REGIMEN_AFILIACION_OPTIONS = [
  { value: 'CONTRIBUTIVO', label: 'Contributivo' },
  { value: 'SUBSIDIADO', label: 'Subsidiado' },
  { value: 'ESPECIAL', label: 'Especial' },
  { value: 'EXCEPTUADO', label: 'Exceptuado' },
  { value: 'NO_AFILIADO', label: 'No Afiliado' }
];

export const TIPO_SANGRE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

export const RELACION_CONTACTO_EMERGENCIA_OPTIONS = [
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'HIJO', label: 'Hijo/Hija' },
  { value: 'HERMANO', label: 'Hermano/Hermana' },
  { value: 'ESPOSO', label: 'Esposo/Esposa' },
  { value: 'CONYUGE', label: 'Cónyuge' },
  { value: 'ABUELO', label: 'Abuelo/Abuela' },
  { value: 'TIO', label: 'Tío/Tía' },
  { value: 'PRIMO', label: 'Primo/Prima' },
  { value: 'AMIGO', label: 'Amigo/Amiga' },
  { value: 'VECINO', label: 'Vecino/Vecina' },
  { value: 'OTRO', label: 'Otro' }
];

export const ESTADO_CITA_OPTIONS = [
  { value: 'PROGRAMADO', label: 'Programado' },
  { value: 'EN_SALA', label: 'En Sala' },
  { value: 'ATENDIDO', label: 'Atendido' },
  { value: 'NO_SE_PRESENTO', label: 'No se Presentó' },
  { value: 'CANCELADO', label: 'Cancelado' }
];

export const ESTADO_CITA_AGENDAR_OPTIONS = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'CANCELADA', label: 'Cancelada' }
];

export const DURACION_CITA_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '40', label: '40 min' },
  { value: '60', label: '1 hora' },

];

export const ESTADO_PACIENTE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' }
];

export const EPS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'nueva_eps', label: 'Nueva EPS' },
  { value: 'salud_total', label: 'Salud Total' },
  { value: 'sanitas', label: 'Sanitas' }
];

// ============================================
// LISTAS PARA EMPLEADOS
// ============================================

export const TIPO_PERSONAL_OPTIONS = [
  { value: 'MEDICO', label: 'Médico' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' }
];

export const ESPECIALIDAD_MEDICA_OPTIONS = [
  { value: 'MEDICINA_GENERAL', label: 'Medicina General' },
  { value: 'PEDIATRIA', label: 'Pediatría' },
  { value: 'GINECOLOGIA', label: 'Ginecología' },
  { value: 'CARDIOLOGIA', label: 'Cardiología' },
  { value: 'DERMATOLOGIA', label: 'Dermatología' },
  { value: 'OFTALMOLOGIA', label: 'Oftalmología' },
  { value: 'ODONTOLOGIA', label: 'Odontología' },
  { value: 'PSICOLOGIA', label: 'Psicología' },
  { value: 'NUTRICION', label: 'Nutrición' },
  { value: 'FISIOTERAPIA', label: 'Fisioterapia' },
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
  { value: 'NEUROLOGIA', label: 'Neurología' },
  { value: 'PSIQUIATRIA', label: 'Psiquiatría' },
  { value: 'UROLOGIA', label: 'Urología' },
  { value: 'GASTROENTEROLOGIA', label: 'Gastroenterología' }
];

export const CARGO_ADMINISTRATIVO_OPTIONS = [
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'AUXILIAR_ADMINISTRATIVO', label: 'Auxiliar Administrativo' },
  { value: 'CONTADOR', label: 'Contador' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'ASISTENTE', label: 'Asistente' },
  { value: 'JEFE_ENFERMERIA', label: 'Jefe de Enfermería' },
  { value: 'RECURSOS_HUMANOS', label: 'Recursos Humanos' },
  { value: 'SISTEMAS', label: 'Sistemas' },
  { value: 'SERVICIOS_GENERALES', label: 'Servicios Generales' }
];

export const TIPO_CONTRATO_OPTIONS = [
  { value: 'INDEFINIDO', label: 'Indefinido' },
  { value: 'FIJO', label: 'Término Fijo' },
  { value: 'OBRA', label: 'Por Obra o Labor' },
  { value: 'PRESTACION', label: 'Prestación de Servicios' },
  { value: 'APRENDIZAJE', label: 'Aprendizaje' },
  { value: 'TEMPORAL', label: 'Temporal' }
];