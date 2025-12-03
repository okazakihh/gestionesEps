/**
 * generarExamenesHTML.js
 * 
 * Generador de HTML para documentos de órdenes de exámenes
 */

import { ipsConfig } from '../../../../negocio/utils/ipsConfig.js';
import { generarEncabezadoHTML, generarPieHTML, generarMedicoHTML, generarFirmaHTML } from './htmlTemplates.js';
import { styles } from './styles.js';
import { generarInfoPacienteHTML } from './patientInfo.js';

/**
 * Genera HTML específico para Exámenes (documento independiente)
 * @param {Object} consulta - Objeto procesado de consulta (con campo examenes)
 * @param {Object} historiaClinica - Historia clínica asociada (opcional)
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @param {Object} config - Configuración IPS
 * @returns {string} HTML completo listo para imprimir
 */
export const generarExamenesHTML = (consulta = {}, historiaClinica = {}, patient = {}, patientData = {}, config = ipsConfig) => {
  const numeroHistoria = historiaClinica.numeroHistoria || 'N/A';

  const medicoHTML = generarMedicoHTML(consulta);

  // Exámenes solicitados
  const examenes = consulta.examenes || [];
  let examenesHTML = '';
  
  if (Array.isArray(examenes) && examenes.length > 0) {
    examenesHTML = `
      <div class="section-title">EXÁMENES SOLICITADOS</div>
      <table style="width:100%; border-collapse: collapse; margin-bottom:10px; font-size:9px; border:1px solid #ddd;">
        <thead>
          <tr style="background-color:#f0f0f0;">
            <th style="padding:6px; border:1px solid #ddd; text-align:left; width:20%;">Tipo</th>
            <th style="padding:6px; border:1px solid #ddd; text-align:left; width:40%;">Descripción</th>
            <th style="padding:6px; border:1px solid #ddd; text-align:left; width:40%;">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${examenes.map(ex => `
            <tr>
              <td style="padding:4px; border:1px solid #ddd;">${ex.tipo || ''}</td>
              <td style="padding:4px; border:1px solid #ddd;">${ex.descripcion || ''}</td>
              <td style="padding:4px; border:1px solid #ddd;">${ex.observaciones || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    examenesHTML = `
      <div class="section-title">EXÁMENES SOLICITADOS</div>
      <table style="width:100%; border-collapse: collapse; margin-bottom:10px; font-size:9px; border:1px solid #ddd;">
        <tr>
          <td style="padding:10px; text-align:center; color:#666;">No se han solicitado exámenes</td>
        </tr>
      </table>
    `;
  }

  const firmaHTML = generarFirmaHTML(consulta);

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Exámenes - ${numeroHistoria}</title>
      ${styles}
    </head>
    <body>
      ${generarEncabezadoHTML(numeroHistoria, config, 'ORDEN DE EXÁMENES')}
      ${generarInfoPacienteHTML(patient, patientData)}
      ${medicoHTML}
      ${examenesHTML}
      ${firmaHTML}
      ${generarPieHTML(config)}
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;

  return html;
};
