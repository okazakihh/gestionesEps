/**
 * generarAntecedentesHTML.js
 * 
 * Genera la sección de antecedentes médicos para la historia clínica
 */

import { hasValue } from './formatters.js';

/**
 * Genera antecedentes médicos
 * @param {Object} historiaData - Datos de la historia
 * @returns {string} HTML con antecedentes
 */
export const generarAntecedentesHTML = (historiaData) => {
  if (!historiaData?.antecedentes) {
    return '';
  }

  const antecedentes = historiaData.antecedentes;
  let html = `
    <div class="section-title" style="margin-top: 10px;">ANTECEDENTES</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 10px; border: 1px solid #ddd;">
  `;

  // Antecedentes Patológicos
  if (antecedentes.patologicos?.selected?.length > 0 && !antecedentes.patologicos.selected.includes('ninguno')) {
    const valor = antecedentes.patologicos.selected.join(', ') + 
                  (antecedentes.patologicos.detalles ? ` - ${antecedentes.patologicos.detalles}` : '');
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Antecedentes Patológicos:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${valor}</td>
      </tr>
    `;
  }

  // Antecedentes Familiares
  if (antecedentes.familiares?.selected?.length > 0 && !antecedentes.familiares.selected.includes('ninguno')) {
    const valor = antecedentes.familiares.selected.join(', ') + 
                  (antecedentes.familiares.detalles ? ` - ${antecedentes.familiares.detalles}` : '');
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Antecedentes Familiares:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${valor}</td>
      </tr>
    `;
  }

  // Antecedentes Quirúrgicos
  if (hasValue(antecedentes.quirurgicos)) {
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Antecedentes Quirúrgicos:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.quirurgicos}</td>
      </tr>
    `;
  }

  // Antecedentes Alérgicos
  if (antecedentes.alergicos && !antecedentes.alergicos.ninguno) {
    if (hasValue(antecedentes.alergicos.medicamentos)) {
      html += `
        <tr>
          <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Alergias - Medicamentos:</td>
          <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.alergicos.medicamentos}</td>
        </tr>
      `;
    }
    if (hasValue(antecedentes.alergicos.alimentos)) {
      html += `
        <tr>
          <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Alergias - Alimentos:</td>
          <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.alergicos.alimentos}</td>
        </tr>
      `;
    }
    if (hasValue(antecedentes.alergicos.otros)) {
      html += `
        <tr>
          <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Alergias - Otros:</td>
          <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.alergicos.otros}</td>
        </tr>
      `;
    }
  }

  // Hábitos
  if (hasValue(antecedentes.habitos?.alcohol) && antecedentes.habitos.alcohol !== 'no') {
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Alcohol:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.habitos.alcohol}</td>
      </tr>
    `;
  }
  if (hasValue(antecedentes.habitos?.tabaco) && antecedentes.habitos.tabaco !== 'no') {
    const valor = antecedentes.habitos.tabaco + 
                  (antecedentes.habitos.tabacoCantidad ? ` - ${antecedentes.habitos.tabacoCantidad}` : '');
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Tabaco:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${valor}</td>
      </tr>
    `;
  }
  if (hasValue(antecedentes.habitos?.actividadFisica)) {
    html += `
      <tr>
        <td class="label-cell" style="width: 30%; padding: 4px; border: 1px solid #ddd;">Actividad Física:</td>
        <td class="value-cell" style="width: 70%; padding: 4px; border: 1px solid #ddd;">${antecedentes.habitos.actividadFisica}</td>
      </tr>
    `;
  }

  html += `</table></div>`;
  return html;
};
