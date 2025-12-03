/**
 * HistoriaClinicaHTML.js
 * 
 * Módulo para generar HTML de historias clínicas colombianas listas para imprimir.
 * Cumple con normativa colombiana: Ley 100/1993, Resolución 1995/1999, Decreto 780/2016
 * 
 * Exports:
 * - generarHistoriaClinicaHTML(consultas, historiaClinica, patient, patientData, historiaData, ipsConfig)
 */

import { ipsConfig } from '../../../negocio/utils/ipsConfig.js';
import { generarEncabezadoHTML, generarPieHTML } from './HistoriaClinicaPrint/htmlTemplates.js';
import { generarInfoPacienteHTML } from './HistoriaClinicaPrint/patientInfo.js';
import { styles } from './HistoriaClinicaPrint/styles.js';
import { generarAntecedentesHTML } from './HistoriaClinicaPrint/generarAntecedentesHTML.js';
import { generarConsultaHTML } from './HistoriaClinicaPrint/generarConsultaHTML.js';

// Re-exportar funciones de generación de documentos individuales para compatibilidad
export { generarIncapacidadHTML } from './HistoriaClinicaPrint/generarIncapacidadHTML.js';
export { generarTratamientoHTML } from './HistoriaClinicaPrint/generarTratamientoHTML.js';
export { generarExamenesHTML } from './HistoriaClinicaPrint/generarExamenesHTML.js';

// Las funciones generarAntecedentesHTML, generarConsultaHTML,
// generarIncapacidadHTML, generarTratamientoHTML y generarExamenesHTML
// han sido movidas a archivos separados en ./HistoriaClinicaPrint/
// y son re-exportadas al inicio de este archivo para mantener compatibilidad

/**
 * Genera HTML completo de la historia clínica
 * @param {Array} consultas - Lista de consultas
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @param {Object} historiaData - Datos parseados de historia
 * @param {Object} config - Configuración de la IPS (opcional)
 * @returns {string} HTML completo listo para imprimir
 */
export const generarHistoriaClinicaHTML = (
  consultas = [],
  historiaClinica = {},
  patient = {},
  patientData = {},
  historiaData = null,
  config = ipsConfig
) => {
  const numeroHistoria = historiaClinica.numeroHistoria || 'N/A';

  // inject firmaDigital from historiaData into initial consulta if present
  const consultasConFirma = (consultas || []).map(c => {
    try {
      const idStr = String(c.id || '');
      if (idStr.startsWith('initial-') && historiaData && historiaData.firmaDigital) {
        return { ...c, firmaDigital: historiaData.firmaDigital };
      }
    } catch (e) {
      // ignore
    }
    return c;
  });
  
  // Construir HTML completo
  const html = `
    <!DOCTYPE html>
    <html lang="es-CO">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Historia Clínica - ${numeroHistoria}</title>
      ${styles}
    </head>
    <body>
      ${generarEncabezadoHTML(numeroHistoria, config)}
      ${generarInfoPacienteHTML(patient, patientData)}

      <!-- Antecedentes -->
      ${generarAntecedentesHTML(historiaData)}

      <!-- Consultas -->
      ${consultasConFirma.map(consulta => generarConsultaHTML(consulta, numeroHistoria, config)).join('\n')}

      ${generarPieHTML(config)}

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  return html;
};
