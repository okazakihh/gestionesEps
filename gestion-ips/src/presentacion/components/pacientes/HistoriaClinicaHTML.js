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

/**
 * Formatea fecha en formato colombiano
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
const formatDate = (dateString) => {
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
const formatTime = (dateString) => {
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
const calcularEdad = (fechaNacimiento) => {
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
const hasValue = (value) => {
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
const formatSignosVitales = (signosVitales) => {
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

/**
 * Genera el encabezado HTML para historias clínicas en formato tabla
 * @param {string} numeroHistoria - Número de la historia clínica
 * @param {Object} config - Configuración de la IPS
 * @returns {string} HTML del encabezado
 */
const generarEncabezadoHTML = (numeroHistoria, config, titulo = 'HISTORIA CLÍNICA') => {
  const fechaHoraActual = `${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  
  return `
    <table class="header-table" style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
      <tr>
        <td style="width: 20%; text-align: center; padding: 8px; border: 1px solid #000;">
          ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-width: 80px; max-height: 60px;">` : `<div style="font-size: 11px; color: #111; font-weight:700;">${config.nombre || 'IPS'}</div>`}
        </td>
        <td style="width: 60%; text-align: center; padding: 8px; border: 1px solid #000; border-left: none;">
          <strong style="font-size: 11px; display: block;">${config.nombre || 'IPS'}</strong>
          <div style="font-size: 9px; margin-top: 2px;">${config.nit || 'N/A'}</div>
          <div style="font-size: 9px;">${config.direccion || 'N/A'}</div>
        </td>
        <td style="width: 20%; padding: 4px; border: 1px solid #000; border-left: none; font-size: 8px;">
          <strong>Documento:</strong> HC<br>
          <strong># Doc:</strong> ${numeroHistoria}<br>
          <strong>Fecha:</strong> ${fechaHoraActual}
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; background-color: #000; color: white; padding: 4px; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
      ${titulo}
    </div>
  `;
};

/**
 * Genera el pie de página HTML para historias clínicas
 * @param {Object} config - Configuración de la IPS
 * @returns {string} HTML del pie de página
 */
const generarPieHTML = (config) => {
  const fechaHoraActual = new Date().toLocaleString('es-CO');
  const direccion = config?.direccion || '';
  const ciudad = config?.ciudad ? `, ${config.ciudad}` : '';
  const telefono = config?.telefono || '';
  const email = config?.email || '';
  const sitioWeb = config?.sitioWeb || '';
  const horario = config?.horarioAtencion || '';
  const habilitacion = config?.codigoHabilitacion || '';

  return `
    <div class="footer" style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #000; font-size: 9px; color: #6b7280;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div style="flex:1; text-align:left;">
          <strong>${config?.nombre || ''}</strong><br/>
          ${direccion}${ciudad}<br/>
          ${habilitacion ? `<span>Habilitación: ${habilitacion}</span><br/>` : ''}
        </div>
        <div style="flex:1; text-align:center;">
          <div>Fecha Impresión: ${fechaHoraActual}</div>
          <div style="margin-top:4px;">Página 1 de 1</div>
        </div>
        <div style="flex:1; text-align:right;">
          ${telefono ? `<div>Tel: ${telefono}</div>` : ''}
          ${email ? `<div>Email: ${email}</div>` : ''}
          ${sitioWeb ? `<div>${sitioWeb}</div>` : ''}
          ${horario ? `<div style="margin-top:4px;">Horario: ${horario}</div>` : ''}
        </div>
      </div>
    </div>
  `;
};

// Estilos CSS compartidos para impresión
const styles = `
    <style>
      @media print {
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 8px; 
          font-size: 9px; 
          line-height: 1.3; 
          color: #111827;
        }
        .header { 
          border-bottom: 2px solid #2563eb; 
          padding-bottom: 8px; 
          margin-bottom: 12px; 
          text-align: center; 
        }
        .institution-info { 
          background: #f0f9ff; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 10px; 
        }
        .patient-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .patient-table td {
          border: 1px solid #000;
          padding: 3px 5px;
          font-size: 9px;
        }
        .label-cell {
          background-color: #f0f0f0;
          font-weight: bold;
          width: 15%;
          text-align: left;
        }
        .value-cell {
          background-color: white;
          text-align: left;
          width: 18%;
        }
        .section-header {
          background-color: #e0e0e0;
          padding: 4px 6px;
          font-weight: bold;
          font-size: 10px;
          border: 1px solid #000;
          margin-top: 10px;
          margin-bottom: 5px;
        }
        .consulta { 
          border: 1px solid #000; 
          padding: 6px; 
          margin-bottom: 10px; 
          page-break-inside: avoid; 
        }
        .consulta-header { 
          background: #f3f4f6; 
          padding: 6px; 
          margin: -8px -8px 8px -8px; 
          border-radius: 4px 4px 0 0; 
          border-bottom: 1px solid #d1d5db; 
        }
        .section { 
          margin-bottom: 6px; 
        }
        .section-title { 
          font-weight: bold; 
          color: #000; 
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          padding: 4px 6px; 
          font-size: 10px; 
          margin-top: 8px;
          margin-bottom: 5px;
        }
        .field { 
          margin-bottom: 4px; 
        }
        .field-label { 
          font-weight: 600; 
          display: inline-block; 
          min-width: 100px; 
          color: #6b7280; 
        }
        .footer { 
          margin-top: 20px; 
          padding-top: 10px; 
          border-top: 1px solid #e5e7eb; 
          font-size: 9px; 
          color: #6b7280; 
        }
        .consent-section { 
          background: #ecfdf5; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 10px; 
          border: 1px solid #d1fae5; 
        }
        .grid-2 { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 6px; 
        }
        .grid-3 { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr; 
          gap: 6px; 
        }
        .important-note { 
          background: #fee2e2; 
          border: 1px solid #fecaca; 
          padding: 6px; 
          border-radius: 3px; 
          margin: 4px 0; 
        }
        @page { 
          margin: 1cm; 
          size: A4; 
        }
      }
    </style>
  `;

/**
 * Genera información del paciente
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados
 * @returns {string} HTML con información del paciente
 */
const generarInfoPacienteHTML = (patient, patientData) => {
  const patientInfo = patientData?.informacionPersonal || {};
  const patientContact = patientData?.informacionContacto || {};
  const patientMedical = patientData?.informacionMedica || {};
  
  const nombres = [patientInfo.primerNombre, patientInfo.segundoNombre].filter(Boolean).join(' ') || 'N/A';
  const apellidos = [patientInfo.primerApellido, patientInfo.segundoApellido].filter(Boolean).join(' ') || 'N/A';
  const edad = calcularEdad(patientInfo.fechaNacimiento);
  const ciudad = patientContact.ciudad || 'N/A';

  return `
    <!-- Información del Paciente en formato tabla -->
    <table class="patient-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px;">
      <tr>
        <td class="label-cell">Nombres:</td>
        <td class="value-cell">${nombres}</td>
        <td class="label-cell">Apellidos:</td>
        <td class="value-cell">${apellidos}</td>
        <td class="label-cell">Ciudad:</td>
        <td class="value-cell">${ciudad}</td>
      </tr>
      <tr>
        <td class="label-cell">Tipo Doc:</td>
        <td class="value-cell">${patient?.tipoDocumento || 'N/A'}</td>
        <td class="label-cell"># Doc:</td>
        <td class="value-cell">${patient?.numeroDocumento || 'N/A'}</td>
        <td class="label-cell">RH:</td>
        <td class="value-cell">${patientMedical.tipoSangre || patientInfo.tipoSangre || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">FN:</td>
        <td class="value-cell">${patientInfo.fechaNacimiento || 'N/A'}</td>
        <td class="label-cell">Edad:</td>
        <td class="value-cell">${edad}</td>
        <td class="label-cell">Teléfono:</td>
        <td class="value-cell">${patientContact.telefono || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">Sexo:</td>
        <td class="value-cell">${patientInfo.genero || 'N/A'}</td>
        <td class="label-cell">E.Civil:</td>
        <td class="value-cell">${patientInfo.estadoCivil || 'N/A'}</td>
        <td class="label-cell">Entidad:</td>
        <td class="value-cell">${patientMedical.eps || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">Dirección:</td>
        <td class="value-cell" colspan="3">${patientContact.direccion || 'N/A'}</td>
        <td class="label-cell">Ocupación</td>
        <td class="value-cell">${patientInfo.ocupacion || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">Fecha de realización</td>
        <td class="value-cell" colspan="3">${new Date().toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
        <td class="label-cell">Estado</td>
        <td class="value-cell">ACTIVA</td>
      </tr>
    </table>
  `;
};

/**
 * Genera antecedentes médicos
 * @param {Object} historiaData - Datos de la historia
 * @returns {string} HTML con antecedentes
 */
const generarAntecedentesHTML = (historiaData) => {
  if (!historiaData?.antecedentes) {
    return '';
  }

  const antecedentes = historiaData.antecedentes;
  let html = `
    <div class="section-title" style="margin-top: 10px;">📋 ANTECEDENTES</div>
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

/**
 * Genera sección de consentimiento
 * @returns {string} HTML de consentimiento
 */
const generarConsentimientoHTML = () => {
  return `
    <div class="consent-section">
      <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 12px;">
        CONSENTIMIENTO INFORMADO Y DERECHOS DEL PACIENTE
      </h4>
      <p style="margin: 5px 0; font-size: 10px;">
        <strong>Consentimiento:</strong> El paciente ha sido informado sobre los procedimientos médicos, riesgos, beneficios y alternativas.
        Ha autorizado el tratamiento y manejo de su información médica conforme a la Ley 1581 de 2012.
      </p>
      <p style="margin: 5px 0; font-size: 10px;">
        <strong>Derechos del Paciente:</strong> Conoce sus derechos a la privacidad, confidencialidad, acceso a su historia clínica,
        segunda opinión médica y atención digna según la normatividad colombiana.
      </p>
    </div>
  `;
};

/**
 * Genera HTML de una consulta
 * @param {Object} consulta - Datos de la consulta
 * @param {string} numeroHistoria - Número de historia clínica
 * @param {Object} config - Configuración IPS
 * @returns {string} HTML de la consulta
 */
const generarConsultaHTML = (consulta, numeroHistoria, config) => {
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
    <div class="section-title">DIAGNÓSTICO</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; border: 1px solid #ddd;">
      ${diagnosticosFormatted}
    </table>
  `;
  }

    // Incapacidad
    const incapacidadHTML = hasValue(consulta.incapacidad) ? `
      <div class="section-title">INCAPACIDAD</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; border: 1px solid #ddd;">
        <tr>
          <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Tipo:</td>
          <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.incapacidad.tipo || ''}</td>
        </tr>
        <tr>
          <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Fecha Inicio:</td>
          <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.incapacidad.fechaInicio || ''}</td>
        </tr>
        <tr>
          <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Fecha Fin:</td>
          <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.incapacidad.fechaFin || ''}</td>
        </tr>
        <tr>
          <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Días:</td>
          <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.incapacidad.dias || ''}</td>
        </tr>
        <tr>
          <td class="label-cell" style="width: 25%; padding: 4px; border: 1px solid #ddd;">Motivo:</td>
          <td class="value-cell" style="width: 75%; padding: 4px; border: 1px solid #ddd;">${consulta.incapacidad.motivo || ''}</td>
        </tr>
      </table>
    ` : '';

  return `
    <div class="section-header">
      ${consulta.tipo} #${consulta.numero} - ${fechaConsulta}
    </div>
    
    ${medicoHTML}
    ${motivoAnamnesisHTML}
    ${examenFisicoHTML}
    ${diagnosticoHTML}
    ${incapacidadHTML}
    
    <div style="text-align: center; margin: 15px 0; padding: 8px; border: 1px solid #000; font-size: 9px;">
      <strong>Firmado Electrónicamente: ${consulta.medico || 'N/A'}</strong>
    </div>
  `;
};

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
      ${incapacidadSection}
      ${generarPieHTML(config)}
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;

  return html;
};

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

      ${diagnosticosHTML ? `<div class="section-title">DIAGNÓSTICOS</div><table style="width:100%; border-collapse: collapse;">${diagnosticosHTML}</table>` : ''}
      ${planHTML}
      ${medicamentosHTML ? `<div class="section-title">MEDICAMENTOS</div><table style="width:100%; border-collapse: collapse;">${medicamentosHTML}</table>` : ''}

      ${generarPieHTML(config)}
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;

  return html;
};

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
      ${consultas.map(consulta => generarConsultaHTML(consulta, numeroHistoria, config)).join('\n')}

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
