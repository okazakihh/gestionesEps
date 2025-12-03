/**
 * htmlTemplates.js
 * 
 * Plantillas HTML para encabezados, pies de página y otros elementos comunes
 */

/**
 * Genera el encabezado HTML para historias clínicas en formato tabla
 * @param {string} numeroHistoria - Número de la historia clínica
 * @param {Object} config - Configuración de la IPS
 * @param {string} titulo - Título del documento
 * @returns {string} HTML del encabezado
 */
export const generarEncabezadoHTML = (numeroHistoria, config, titulo = 'HISTORIA CLÍNICA') => {
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
export const generarPieHTML = (config) => {
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

/**
 * Genera información del médico en formato HTML
 * @param {Object} consulta - Objeto consulta con datos del médico
 * @returns {string} HTML con información del médico
 */
export const generarMedicoHTML = (consulta) => {
  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; page-break-inside: avoid;">
      <tr>
        <td class="label-cell" style="width: 18%;">Médico:</td>
        <td class="value-cell" style="width: 32%;">${consulta.medico || 'N/A'}</td>
        <td class="label-cell" style="width: 18%;">Especialidad:</td>
        <td class="value-cell" style="width: 32%;">${consulta.especialidad || 'N/A'}</td>
      </tr>
    </table>
  `;
};

/**
 * Genera sección de firma digital en formato HTML
 * @param {Object} consulta - Objeto consulta con datos de firma
 * @returns {string} HTML con firma digital
 */
export const generarFirmaHTML = (consulta) => {
  // Detectar firma digital
  const firma = consulta.firmaDigital || consulta.imagen || consulta.image || consulta.firma || consulta.signature || null;
  let firmaSrc = null;
  if (firma) {
    if (typeof firma === 'string') firmaSrc = firma;
    else if (firma.imagen) firmaSrc = firma.imagen;
    else if (firma.image) firmaSrc = firma.image;
    else if (firma.firma) firmaSrc = firma.firma;
    else if (firma.signature) firmaSrc = firma.signature;
  }

  if (firmaSrc) {
    return `
      <div style="text-align:center;margin: 15px auto;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="margin-bottom:6px;"><img src="${firmaSrc}" alt="Firma" style="width:150px; height:60px; object-fit:contain; border:1px solid #ccc;"/></div>
        <div style="text-align:center;">
          <strong>${consulta.medico || 'N/A'}</strong><br/>
          <span style="font-size:8px;">Registro Médico: ${consulta.registroMedico || 'N/A'} | Especialidad: ${consulta.especialidad || 'N/A'}</span>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="text-align: center; margin: 15px 0; padding: 8px; border: 1px solid #000; font-size: 9px;">
        <strong>${consulta.medico || 'N/A'}</strong><br/>
        <span style="font-size:8px;">Registro Médico: ${consulta.registroMedico || 'N/A'} | Especialidad: ${consulta.especialidad || 'N/A'}</span>
      </div>
    `;
  }
};
