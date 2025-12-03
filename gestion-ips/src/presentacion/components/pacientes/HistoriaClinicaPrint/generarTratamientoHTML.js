/**
 * generarTratamientoHTML.js
 * 
 * Generador de HTML para documentos de plan de tratamiento
 */

import { ipsConfig } from '../../../../negocio/utils/ipsConfig.js';
import { hasValue } from './formatters.js';
import { generarEncabezadoHTML, generarPieHTML, generarMedicoHTML, generarFirmaHTML } from './htmlTemplates.js';
import { styles } from './styles.js';
import { generarInfoPacienteHTML } from './patientInfo.js';

/**
 * Genera HTML específico para el Plan de Tratamiento (documento independiente)
 * @param {Object} consulta - Objeto procesado de consulta (con campos diagnosticos, planTratamiento, medicamentos)
 * @param {Object} historiaClinica - Historia clínica asociada (opcional)
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @param {Object} config - Configuración IPS
 * @returns {string} HTML completo listo para imprimir
 */
export const generarTratamientoHTML = (consulta = {}, historiaClinica = {}, patient = {}, patientData = {}, config = ipsConfig) => {
  const numeroHistoria = historiaClinica.numeroHistoria || 'N/A';

  const medicoHTML = generarMedicoHTML(consulta);

  // Diagnósticos
  let diagnosticosHTML = '';
  const diagnosticos = consulta.diagnosticos;
  if (Array.isArray(diagnosticos)) {
    diagnosticosHTML = diagnosticos.map(dx => `<tr><td class="value-cell" style="padding:4px;border:1px solid #ddd;"><strong>${dx.codigo || ''}</strong> ${dx.descripcion || dx.nombre || ''}</td></tr>`).join('');
  } else if (typeof diagnosticos === 'string') {
    diagnosticosHTML = `<tr><td class="value-cell" style="padding:4px;border:1px solid #ddd;">${diagnosticos}</td></tr>`;
  }

  const planHTML = hasValue(consulta.planTratamiento) ? `
    <div class="section-title">PLAN DE TRATAMIENTO</div>
    <table style="width:100%; border-collapse: collapse; margin-bottom:10px; font-size:9px; border:1px solid #ddd;">
      <tr>
        <td class="value-cell" style="padding:4px; border:1px solid #ddd;">${consulta.planTratamiento}</td>
      </tr>
    </table>
  ` : '';

  const medicamentos = consulta.formulaMedica || consulta.medicamentos || [];
  let medicamentosHTML = '';
  if (Array.isArray(medicamentos) && medicamentos.length > 0) {
    medicamentosHTML = medicamentos.map(m => `<tr><td class="value-cell" style="padding:4px;border:1px solid #ddd;">${m.medicamento || m.nombre || ''} ${m.dosis ? '- ' + m.dosis : ''} ${m.duracion ? '(' + m.duracion + ')' : ''}</td></tr>`).join('');
  }

  const firmaHTML = generarFirmaHTML(consulta);

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Plan de Tratamiento - ${numeroHistoria}</title>
      ${styles}
    </head>
    <body>
      ${generarEncabezadoHTML(numeroHistoria, config, 'PLAN DE TRATAMIENTO')}
      ${generarInfoPacienteHTML(patient, patientData)}
      ${medicoHTML}

      ${diagnosticosHTML ? `<div class="section-title">DIAGNÓSTICOS</div><table style="width:100%; border-collapse: collapse;">${diagnosticosHTML}</table>` : ''}
      ${planHTML}
      ${medicamentosHTML ? `<div class="section-title">MEDICAMENTOS</div><table style="width:100%; border-collapse: collapse;">${medicamentosHTML}</table>` : ''}

      ${firmaHTML}
      ${generarPieHTML(config)}
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;

  return html;
};
