/**
 * generarConsultaHTML.js
 * 
 * Genera el HTML de una consulta médica individual
 */

import { formatDate, hasValue, formatSignosVitales } from './formatters.js';

/**
 * Genera HTML de una consulta
 * @param {Object} consulta - Datos de la consulta
 * @param {string} numeroHistoria - Número de historia clínica
 * @param {Object} config - Configuración IPS
 * @returns {string} HTML de la consulta
 */
export const generarConsultaHTML = (consulta, numeroHistoria, config) => {
  const fechaConsulta = formatDate(consulta.fecha);

  // Información del médico
  const medicoHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; page-break-inside: avoid;">
      <tr>
        <td class="label-cell" style="width: 18%;">Médico:</td>
        <td class="value-cell" style="width: 32%;">${consulta.medico || 'N/A'}</td>
        <td class="label-cell" style="width: 18%;">Especialidad:</td>
        <td class="value-cell" style="width: 32%;">${consulta.especialidad || 'N/A'}</td>
      </tr>
    </table>
  `;

  // Motivo de consulta y anamnesis
  const motivoAnamnesisHTML = (consulta.motivo || consulta.enfermedadActual) ? `
    <div class="section-title">MOTIVO DE CONSULTA Y ANAMNESIS</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; border: 1px solid #ddd;">
      ${hasValue(consulta.motivo) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Motivo de Consulta:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.motivo}</td>
      </tr>
      ` : ''}
      ${hasValue(consulta.enfermedadActual) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Revisión de Sistemas:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.enfermedadActual}</td>
      </tr>
      ` : ''}
    </table>
  ` : '';

  // Examen físico (incluyendo signos vitales y examen físico general)
  const signosVitalesFormatted = formatSignosVitales(consulta.signosVitales);
  const tieneExamenFisico = signosVitalesFormatted || hasValue(consulta.examenFisico) || 
                            hasValue(consulta.dependenciaMedica) || 
                            (consulta.sistemas && Object.keys(consulta.sistemas).some(key => hasValue(consulta.sistemas[key]))) ||
                            (consulta.camposEspecificos && Object.keys(consulta.camposEspecificos).some(key => hasValue(consulta.camposEspecificos[key])));
  
  const examenFisicoHTML = tieneExamenFisico ? `
    <div class="section-title">EXAMEN FÍSICO</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; border: 1px solid #ddd;">
      ${hasValue(consulta.dependenciaMedica) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Dependencia Médica:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.dependenciaMedica}</td>
      </tr>
      ` : ''}
      ${hasValue(consulta.examenFisico) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Estado General:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.examenFisico}</td>
      </tr>
      ` : ''}
      ${signosVitalesFormatted ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Signos Vitales:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${signosVitalesFormatted}</td>
      </tr>
      ` : ''}
      ${consulta.sistemas && hasValue(consulta.sistemas.cardiovascular) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Cardiovascular:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.sistemas.cardiovascular}</td>
      </tr>
      ` : ''}
      ${consulta.sistemas && hasValue(consulta.sistemas.respiratorio) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Respiratorio:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.sistemas.respiratorio}</td>
      </tr>
      ` : ''}
      ${consulta.sistemas && hasValue(consulta.sistemas.gastrointestinal) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Gastrointestinal:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.sistemas.gastrointestinal}</td>
      </tr>
      ` : ''}
      ${consulta.sistemas && hasValue(consulta.sistemas.neurologico) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Neurológico:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.sistemas.neurologico}</td>
      </tr>
      ` : ''}
      ${consulta.sistemas && hasValue(consulta.sistemas.musculoesqueletico) ? `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Musculoesquelético:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.sistemas.musculoesqueletico}</td>
      </tr>
      ` : ''}
      ${consulta.camposEspecificos ? Object.entries(consulta.camposEspecificos).map(([key, value]) => {
        if (!hasValue(value)) return '';
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        return `
      <tr>
        <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">${label}:</td>
        <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${value}</td>
      </tr>
        `;
      }).join('') : ''}
    </table>
  ` : '';

  // Diagnóstico
  let diagnosticoHTML = '';
  if (hasValue(consulta.diagnosticos)) {
    let diagnosticosFormatted = '';
    
    if (Array.isArray(consulta.diagnosticos)) {
      // Si es un array de objetos de diagnóstico
      diagnosticosFormatted = consulta.diagnosticos.map(dx => {
        const tipo = dx.tipo || 'Principal';
        const codigo = dx.codigo || '';
        const descripcion = dx.descripcion || dx.nombre || '';
        return `<tr>
          <td class="value-cell" style="padding: 4px; border: 1px solid #ddd;">
            <strong>[${tipo.toUpperCase()}]</strong> ${codigo} - ${descripcion}
          </td>
        </tr>`;
      }).join('');
    } else if (typeof consulta.diagnosticos === 'string') {
      // Si es un string simple
      diagnosticosFormatted = `<tr>
        <td class="value-cell" style="padding: 4px; border: 1px solid #ddd;"><strong>${consulta.diagnosticos}</strong></td>
      </tr>`;
    }
    
    diagnosticoHTML = `
    <div class="section-title">DIAGNOSTICO</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; border: 1px solid #ddd;">
      ${diagnosticosFormatted}
    </table>
  `;
  }

  // Detectar posible firma digital en distintos campos
  const firma = consulta.firmaDigital || consulta.imagen || consulta.image || consulta.firma || consulta.signature || null;
  let firmaSrc = null;
  if (firma) {
    if (typeof firma === 'string') firmaSrc = firma;
    else if (firma.imagen) firmaSrc = firma.imagen;
    else if (firma.image) firmaSrc = firma.image;
    else if (firma.firma) firmaSrc = firma.firma;
    else if (firma.signature) firmaSrc = firma.signature;
  }

  return `
    <div class="section-header">
      ${consulta.tipo} #${consulta.numero} - ${fechaConsulta}
    </div>
  
    ${medicoHTML}
    ${motivoAnamnesisHTML}
    ${examenFisicoHTML}
    ${diagnosticoHTML}
  
    ${firmaSrc ? `
      <div style="text-align:center;margin: 15px auto;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="margin-bottom:6px;"><img src="${firmaSrc}" alt="Firma" style="width:150px; height:60px; object-fit:contain; border:1px solid #ccc;"/></div>
        <div style="text-align:center;">
          <strong>${consulta.medico || 'N/A'}</strong><br/>
          <span style="font-size:8px;">Registro Médico: ${consulta.registroMedico || 'N/A'} | Especialidad: ${consulta.especialidad || 'N/A'}</span>
        </div>
      </div>
    ` : `
      <div style="text-align: center; margin: 15px 0; padding: 8px; border: 1px solid #000; font-size: 9px;">
        <strong>${consulta.medico || 'N/A'}</strong><br/>
        <span style="font-size:8px;">Registro Médico: ${consulta.registroMedico || 'N/A'} | Especialidad: ${consulta.especialidad || 'N/A'}</span>
      </div>
    `}
  `;
};
