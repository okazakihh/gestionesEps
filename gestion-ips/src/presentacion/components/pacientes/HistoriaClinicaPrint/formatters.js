/**
 * formatters.js
 * 
 * Utilidades para formateo de datos en historias clínicas
 */

/**
 * Formatea fecha en formato colombiano
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formatea hora en formato colombiano
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Hora formateada
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleTimeString('es-CO');
  } catch {
    return '';
  }
};

/**
 * Calcula la edad del paciente
 * @param {string} fechaNacimiento - Fecha de nacimiento
 * @returns {string} Edad formateada
 */
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'N/A';
  try {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return `${edad} años`;
  } catch {
    return 'N/A';
  }
};

/**
 * Verifica si un valor tiene datos válidos
 * @param {*} value - Valor a verificar
 * @returns {boolean} True si tiene datos válidos
 */
export const hasValue = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (value === 'No registrado' || value === 'N/A' || value === 'Sin notas') return false;
  if (value === 'Ninguno' || value === 'ninguno') return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  
  // Detectar arrays vacíos
  if (Array.isArray(value) && value.length === 0) return false;
  
  // Detectar objetos vacíos o con solo valores vacíos
  if (typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return false;
    // Verificar si todas las propiedades están vacías
    const hasAnyValue = keys.some(key => hasValue(value[key]));
    return hasAnyValue;
  }
  
  return true;
};

/**
 * Formatea signos vitales (puede ser string u objeto)
 * @param {string|Object} signosVitales - Signos vitales
 * @returns {string} String formateado o null si no hay datos
 */
export const formatSignosVitales = (signosVitales) => {
  if (!hasValue(signosVitales)) return null;
  
  // Si es string, retornarlo directamente
  if (typeof signosVitales === 'string') {
    return signosVitales;
  }
  
  // Si es objeto, formatear las propiedades que tengan valor
  if (typeof signosVitales === 'object') {
    const campos = [];
    
    if (hasValue(signosVitales.presionArterial)) campos.push(`PA: ${signosVitales.presionArterial}`);
    if (hasValue(signosVitales.frecuenciaCardiaca)) campos.push(`FC: ${signosVitales.frecuenciaCardiaca}`);
    if (hasValue(signosVitales.frecuenciaRespiratoria)) campos.push(`FR: ${signosVitales.frecuenciaRespiratoria}`);
    if (hasValue(signosVitales.temperatura)) campos.push(`T: ${signosVitales.temperatura}`);
    if (hasValue(signosVitales.saturacionO2)) campos.push(`SpO2: ${signosVitales.saturacionO2}`);
    if (hasValue(signosVitales.peso)) campos.push(`Peso: ${signosVitales.peso}`);
    if (hasValue(signosVitales.talla)) campos.push(`Talla: ${signosVitales.talla}`);
    if (hasValue(signosVitales.imc)) campos.push(`IMC: ${signosVitales.imc}`);
    
    return campos.length > 0 ? campos.join(', ') : null;
  }
  
  return null;
};
