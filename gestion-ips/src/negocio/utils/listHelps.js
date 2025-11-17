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

// ============================================
// LISTAS PARA DEPENDENCIAS MÉDICAS Y EXAMEN FÍSICO
// ============================================

export const DEPENDENCIA_MEDICA_OPTIONS = [
  { value: 'MEDICINA_GENERAL', label: 'Medicina General' },
  { value: 'OTORRINO', label: 'Otorrinolaringología' },
  { value: 'OPTOMETRIA', label: 'Optometría' },
  { value: 'ODONTOLOGIA', label: 'Odontología' },
  { value: 'CARDIOLOGIA', label: 'Cardiología' },
  { value: 'DERMATOLOGIA', label: 'Dermatología' },
  { value: 'GINECOLOGIA', label: 'Ginecología' },
  { value: 'PEDIATRIA', label: 'Pediatría' },
  { value: 'TRAUMATOLOGIA', label: 'Traumatología' },
  { value: 'PSICOLOGIA', label: 'Psicología' },
  { value: 'FISIOTERAPIA', label: 'Fisioterapia' }
];

// Configuración de qué dependencias requieren signos vitales completos
export const REQUIERE_SIGNOS_VITALES = {
  MEDICINA_GENERAL: true,
  PEDIATRIA: true,
  CARDIOLOGIA: true,
  GINECOLOGIA: true,
  TRAUMATOLOGIA: true,
  FISIOTERAPIA: false, // Solo algunos signos específicos
  OTORRINO: false,
  OPTOMETRIA: false,
  ODONTOLOGIA: false,
  DERMATOLOGIA: false,
  PSICOLOGIA: false
};

// Configuración de qué dependencias requieren examen físico por sistemas
export const REQUIERE_EXAMEN_SISTEMAS = {
  MEDICINA_GENERAL: true,
  PEDIATRIA: true,
  CARDIOLOGIA: false, // Tiene su propio examen cardiovascular específico
  GINECOLOGIA: false, // Tiene su propio examen ginecológico específico
  TRAUMATOLOGIA: false, // Tiene su propio examen traumatológico específico
  FISIOTERAPIA: false,
  OTORRINO: false,
  OPTOMETRIA: false,
  ODONTOLOGIA: false,
  DERMATOLOGIA: false,
  PSICOLOGIA: false
};

// Configuración de campos específicos por dependencia médica
export const CAMPOS_POR_DEPENDENCIA = {
  MEDICINA_GENERAL: {
    label: 'Medicina General',
    campos: [
      { key: 'cabezaCuello', label: 'Cabeza y Cuello', type: 'textarea' },
      { key: 'toraxPulmones', label: 'Tórax y Pulmones', type: 'textarea' },
      { key: 'cardiovascular', label: 'Sistema Cardiovascular', type: 'textarea' },
      { key: 'abdomen', label: 'Abdomen', type: 'textarea' },
      { key: 'extremidades', label: 'Extremidades', type: 'textarea' },
      { key: 'neurologico', label: 'Examen Neurológico', type: 'textarea' },
      { key: 'pielAnexos', label: 'Piel y Anexos', type: 'textarea' }
    ]
  },
  OTORRINO: {
    label: 'Otorrinolaringología',
    campos: [
      { key: 'otoscopia', label: 'Otoscopia', type: 'textarea', placeholder: 'CAE, membrana timpánica...' },
      { key: 'audiometria', label: 'Audiometría', type: 'textarea', placeholder: 'Resultados de audiometría...' },
      { key: 'rinoscopia', label: 'Rinoscopia', type: 'textarea', placeholder: 'Cornetes, tabique, mucosa...' },
      { key: 'orofaringe', label: 'Orofaringe', type: 'textarea', placeholder: 'Amígdalas, faringe, úvula...' },
      { key: 'laringe', label: 'Laringoscopia', type: 'textarea', placeholder: 'Cuerdas vocales, epiglotis...' },
      { key: 'cuello', label: 'Cuello', type: 'textarea', placeholder: 'Adenopatías, tiroides, movilidad...' },
      { key: 'equilibrio', label: 'Equilibrio y Marcha', type: 'textarea', placeholder: 'Test de Romberg, marcha...' }
    ]
  },
  OPTOMETRIA: {
    label: 'Optometría',
    campos: [
      { key: 'agudezaVisual', label: 'Agudeza Visual', type: 'textarea', placeholder: 'OD: 20/__, OI: 20/__' },
      { key: 'refraccion', label: 'Refracción', type: 'textarea', placeholder: 'OD: Esf ___ Cil ___ Eje ___' },
      { key: 'biomicroscopia', label: 'Biomicroscopía', type: 'textarea', placeholder: 'Párpados, conjuntiva, córnea...' },
      { key: 'fondoOjo', label: 'Fondo de Ojo', type: 'textarea', placeholder: 'Papila, mácula, vasos, retina...' },
      { key: 'presionIntraocular', label: 'Presión Intraocular', type: 'textarea', placeholder: 'OD: ___ mmHg, OI: ___ mmHg' },
      { key: 'visionColor', label: 'Visión de Colores', type: 'textarea', placeholder: 'Test de Ishihara...' },
      { key: 'motilidad', label: 'Motilidad Ocular', type: 'textarea', placeholder: 'Versiones, vergencias, cover test...' }
    ]
  },
  ODONTOLOGIA: {
    label: 'Odontología',
    campos: [
      { key: 'odontograma', label: 'Odontograma', type: 'textarea', placeholder: 'Estado dental por cuadrantes...' },
      { key: 'higieneBucal', label: 'Higiene Bucal', type: 'textarea', placeholder: 'Placa bacteriana, cálculo, gingivitis...' },
      { key: 'oclusion', label: 'Oclusión', type: 'textarea', placeholder: 'Clase molar, relación canina...' },
      { key: 'tejidosBlandos', label: 'Tejidos Blandos', type: 'textarea', placeholder: 'Mucosa, encías, lengua, paladar...' },
      { key: 'atm', label: 'ATM', type: 'textarea', placeholder: 'Apertura, crepitación, dolor...' },
      { key: 'radiografias', label: 'Radiografías', type: 'textarea', placeholder: 'Hallazgos radiográficos...' }
    ]
  },
  CARDIOLOGIA: {
    label: 'Cardiología',
    campos: [
      { key: 'inspeccion', label: 'Inspección', type: 'textarea', placeholder: 'Cianosis, edema, yugulares...' },
      { key: 'palpacion', label: 'Palpación', type: 'textarea', placeholder: 'Latido apical, frémitos...' },
      { key: 'auscultacion', label: 'Auscultación Cardíaca', type: 'textarea', placeholder: 'Ruidos, soplos, ritmo...' },
      { key: 'pulsos', label: 'Pulsos Periféricos', type: 'textarea', placeholder: 'Radial, femoral, pedio, tibial...' },
      { key: 'ekg', label: 'Electrocardiograma', type: 'textarea', placeholder: 'Interpretación del EKG...' },
      { key: 'ecocardiograma', label: 'Ecocardiograma', type: 'textarea', placeholder: 'FEVI, válvulas, dimensiones...' }
    ]
  },
  DERMATOLOGIA: {
    label: 'Dermatología',
    campos: [
      { key: 'lesionPrimaria', label: 'Lesión Primaria', type: 'textarea', placeholder: 'Mácula, pápula, nódulo, vesícula...' },
      { key: 'distribucion', label: 'Distribución', type: 'textarea', placeholder: 'Localización, simetría, patrón...' },
      { key: 'caracteristicas', label: 'Características', type: 'textarea', placeholder: 'Color, tamaño, forma, bordes...' },
      { key: 'piel', label: 'Examen de Piel', type: 'textarea', placeholder: 'Textura, hidratación, temperatura...' },
      { key: 'unas', label: 'Uñas', type: 'textarea', placeholder: 'Coloración, forma, fragilidad...' },
      { key: 'cabello', label: 'Cabello y Cuero Cabelludo', type: 'textarea', placeholder: 'Densidad, caspa, alopecia...' },
      { key: 'mucosas', label: 'Mucosas', type: 'textarea', placeholder: 'Oral, genital, conjuntival...' }
    ]
  },
  GINECOLOGIA: {
    label: 'Ginecología',
    campos: [
      { key: 'inspeccionGenital', label: 'Inspección Genital Externa', type: 'textarea' },
      { key: 'especuloscopia', label: 'Especuloscopia', type: 'textarea', placeholder: 'Cuello, paredes vaginales, secreciones...' },
      { key: 'tactoVaginal', label: 'Tacto Vaginal', type: 'textarea', placeholder: 'Útero, anexos, fondos de saco...' },
      { key: 'mamas', label: 'Examen de Mamas', type: 'textarea', placeholder: 'Inspección, palpación, adenopatías...' },
      { key: 'citologia', label: 'Citología', type: 'textarea', placeholder: 'Fecha última, resultados...' },
      { key: 'colposcopia', label: 'Colposcopia', type: 'textarea', placeholder: 'Hallazgos colposcópicos...' }
    ]
  },
  PEDIATRIA: {
    label: 'Pediatría',
    campos: [
      { key: 'desarrolloPsicomotor', label: 'Desarrollo Psicomotor', type: 'textarea', placeholder: 'Hitos del desarrollo según edad...' },
      { key: 'somatometria', label: 'Somatometría', type: 'textarea', placeholder: 'Peso, talla, PC, IMC, percentiles...' },
      { key: 'examenFisico', label: 'Examen Físico General', type: 'textarea' },
      { key: 'fontanelas', label: 'Fontanelas (si aplica)', type: 'textarea', placeholder: 'Anterior, posterior, tensión...' },
      { key: 'vacunas', label: 'Estado de Vacunación', type: 'textarea', placeholder: 'Esquema completo, pendientes...' },
      { key: 'alimentacion', label: 'Alimentación', type: 'textarea', placeholder: 'Tipo, frecuencia, introducción de alimentos...' }
    ]
  },
  TRAUMATOLOGIA: {
    label: 'Traumatología',
    campos: [
      { key: 'inspeccion', label: 'Inspección', type: 'textarea', placeholder: 'Deformidad, asimetría, edema, equimosis...' },
      { key: 'palpacion', label: 'Palpación', type: 'textarea', placeholder: 'Dolor, crepitación, calor, pulsos...' },
      { key: 'movilidad', label: 'Movilidad Articular', type: 'textarea', placeholder: 'Rango de movimiento, limitación...' },
      { key: 'fuerza', label: 'Fuerza Muscular', type: 'textarea', placeholder: 'Escala 0-5 por grupos musculares...' },
      { key: 'marcha', label: 'Marcha y Postura', type: 'textarea', placeholder: 'Tipo de marcha, claudicación...' },
      { key: 'maniobras', label: 'Maniobras Especiales', type: 'textarea', placeholder: 'Lasègue, Fabere, cajón, McMurray...' },
      { key: 'imagenologia', label: 'Imagenología', type: 'textarea', placeholder: 'Rx, TAC, RMN - Hallazgos...' }
    ]
  },
  PSICOLOGIA: {
    label: 'Psicología',
    campos: [
      { key: 'presentacion', label: 'Presentación y Apariencia', type: 'textarea' },
      { key: 'conciencia', label: 'Estado de Conciencia', type: 'textarea' },
      { key: 'orientacion', label: 'Orientación', type: 'textarea', placeholder: 'Tiempo, espacio, persona...' },
      { key: 'memoria', label: 'Memoria', type: 'textarea', placeholder: 'Reciente, remota, inmediata...' },
      { key: 'pensamiento', label: 'Pensamiento', type: 'textarea', placeholder: 'Curso, contenido, coherencia...' },
      { key: 'afecto', label: 'Afecto y Ánimo', type: 'textarea' },
      { key: 'juicio', label: 'Juicio y Raciocinio', type: 'textarea' },
      { key: 'pruebas', label: 'Pruebas Aplicadas', type: 'textarea', placeholder: 'Nombre de pruebas y resultados...' }
    ]
  },
  FISIOTERAPIA: {
    label: 'Fisioterapia',
    campos: [
      { key: 'postura', label: 'Evaluación Postural', type: 'textarea' },
      { key: 'movilidad', label: 'Movilidad Articular', type: 'textarea', placeholder: 'Goniometría, limitaciones...' },
      { key: 'fuerzaMuscular', label: 'Fuerza Muscular', type: 'textarea', placeholder: 'Test manual muscular...' },
      { key: 'tono', label: 'Tono Muscular', type: 'textarea', placeholder: 'Hipertonía, hipotonía...' },
      { key: 'equilibrio', label: 'Equilibrio y Coordinación', type: 'textarea' },
      { key: 'marcha', label: 'Análisis de Marcha', type: 'textarea' },
      { key: 'dolor', label: 'Evaluación del Dolor', type: 'textarea', placeholder: 'EVA, localización, tipo...' },
      { key: 'funcionalidad', label: 'Capacidad Funcional', type: 'textarea', placeholder: 'AVD, transferencias...' }
    ]
  }
};