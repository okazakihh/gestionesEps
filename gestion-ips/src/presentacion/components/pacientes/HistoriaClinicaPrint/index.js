/**
 * index.js
 * 
 * Módulo principal para generación de documentos HTML de historia clínica
 * Punto de entrada centralizado para todos los generadores
 */

// Generadores de documentos
export { generarHistoriaClinicaHTML } from '../HistoriaClinicaHTML.js';
export { generarIncapacidadHTML } from './generarIncapacidadHTML.js';
export { generarTratamientoHTML } from './generarTratamientoHTML.js';
export { generarExamenesHTML } from './generarExamenesHTML.js';
export { generarAntecedentesHTML } from './generarAntecedentesHTML.js';
export { generarConsultaHTML } from './generarConsultaHTML.js';

// Utilidades
export * from './formatters.js';
export * from './htmlTemplates.js';
export * from './patientInfo.js';
export { styles } from './styles.js';
