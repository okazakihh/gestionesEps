/**
 * generarIncapacidadHTML.js
 * 
 * Generador de HTML para documentos de incapacidad
 */

import { ipsConfig } from '../../../../negocio/utils/ipsConfig.js';
import { generarEncabezadoHTML, generarPieHTML, generarMedicoHTML, generarFirmaHTML } from './htmlTemplates.js';
import { styles } from './styles.js';
import { generarInfoPacienteHTML } from './patientInfo.js';

/**
 * Genera HTML específico para una incapacidad (documento independiente)
 * @param {Object} consulta - Objeto procesado de consulta (con campo incapacidad)
 * @param {Object} historiaClinica - Historia clínica asociada (opcional)
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @param {Object} config - Configuración IPS
 * @returns {string} HTML completo listo para imprimir
 */
export const generarIncapacidadHTML = (consulta = {}, historiaClinica = {}, patient = {}, patientData = {}, config = ipsConfig) => {
  const numeroHistoria = historiaClinica.numeroHistoria || 'N/A';
  const incap = consulta.incapacidad || {};

  const medicoHTML = generarMedicoHTML(consulta);

  const incapacidadSection = (incap && (incap.aplica || incap.tipo || incap.fechaInicio)) ? `
    <div class="section-title">INCAPACIDAD</div>
    <table style="width:100%; border-collapse: collapse; margin-bottom:10px; font-size:9px; border:1px solid #ddd;">
      <tr>
        <td class="label-cell" style="width:25%; padding:4px; border:1px solid #ddd;">Tipo:</td>
        <td class="value-cell" style="width:75%; padding:4px; border:1px solid #ddd;">${incap.tipo || ''}</td>
      </tr>
      <tr>
        <td class="label-cell" style="width:25%; padding:4px; border:1px solid #ddd;">Fecha Inicio:</td>
        <td class="value-cell" style="width:75%; padding:4px; border:1px solid #ddd;">${incap.fechaInicio || ''}</td>
      </tr>
      <tr>
        <td class="label-cell" style="width:25%; padding:4px; border:1px solid #ddd;">Fecha Fin:</td>
        <td class="value-cell" style="width:75%; padding:4px; border:1px solid #ddd;">${incap.fechaFin || ''}</td>
      </tr>
      <tr>
        <td class="label-cell" style="width:25%; padding:4px; border:1px solid #ddd;">Días:</td>
        <td class="value-cell" style="width:75%; padding:4px; border:1px solid #ddd;">${incap.dias || ''}</td>
      </tr>
      <tr>
        <td class="label-cell" style="width:25%; padding:4px; border:1px solid #ddd;">Motivo:</td>
        <td class="value-cell" style="width:75%; padding:4px; border:1px solid #ddd;">${incap.motivo || ''}</td>
      </tr>
    </table>
  ` : '';

  const firmaHTML = generarFirmaHTML(consulta);

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Incapacidad - ${numeroHistoria}</title>
      ${styles}
    </head>
    <body>
      ${generarEncabezadoHTML(numeroHistoria, config, 'INCAPACIDAD')}
      ${generarInfoPacienteHTML(patient, patientData)}
      ${medicoHTML}
      ${incapacidadSection}
      ${firmaHTML}
      ${generarPieHTML(config)}
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;

  return html;
};
