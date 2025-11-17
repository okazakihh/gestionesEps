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
 * Genera el encabezado HTML para historias clínicas en formato tabla
 * @param {string} numeroHistoria - Número de la historia clínica
 * @param {Object} config - Configuración de la IPS
 * @returns {string} HTML del encabezado
 */
const generarEncabezadoHTML = (numeroHistoria, config) => {
  const fechaHoraActual = `${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  
  return `
    <table class="header-table" style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
      <tr>
        <td style="width: 20%; text-align: center; padding: 8px; border: 1px solid #000;">
          ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-width: 80px; max-height: 60px;">` : '<div style="font-size: 10px; color: #666;">LOGO IPS</div>'}
        </td>
        <td style="width: 60%; text-align: center; padding: 8px; border: 1px solid #000; border-left: none;">
          <strong style="font-size: 11px; display: block;">${config.nombre || 'IPS'}</strong>
          <div style="font-size: 9px; margin-top: 2px;">${config.nit || 'N/A'}</div>
          <div style="font-size: 9px;">${config.direccion || 'N/A'}</div>
        </td>
        <td style="width: 20%; padding: 4px; border: 1px solid #000; border-left: none; font-size: 8px;">
          <strong>Tipo Doc:</strong> HC<br>
          <strong># Doc:</strong> ${numeroHistoria}<br>
          <strong>Fecha:</strong> ${fechaHoraActual}
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; background-color: #000; color: white; padding: 4px; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
      HISTORIA CLÍNICA
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
  
  return `
    <div class="footer" style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #000; text-align: center;">
      <p style="margin: 0; font-size: 8px; color: #666;">
        Fecha Impresión: ${fechaHoraActual}
      </p>
      <p style="margin: 5px 0 0 0; font-size: 8px; color: #666;">
        Página 1 de 1
      </p>
    </div>
  `;
};

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
  if (!historiaData || (!historiaData.antecedentesClinico && !historiaData.informacionMedica)) {
    return `
      <div class="medical-antecedents">
        <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">
          ANTECEDENTES MÉDICOS
        </h3>
        <p>No se encontraron antecedentes médicos registrados.</p>
      </div>
    `;
  }

  return `
    <div class="medical-antecedents">
      <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">
        ANTECEDENTES MÉDICOS
      </h3>
      <div class="grid-2">
        <div>
          <strong>Antecedentes Personales:</strong><br>
          ${(historiaData.antecedentesClinico?.antecedentesPersonales || historiaData.informacionMedica?.antecedentesPersonales) || 'No registrados'}
        </div>
        <div>
          <strong>Antecedentes Familiares:</strong><br>
          ${(historiaData.antecedentesClinico?.antecedentesFamiliares || historiaData.informacionMedica?.antecedentesFamiliares) || 'No registrados'}
        </div>
        <div>
          <strong>Antecedentes Quirúrgicos:</strong><br>
          ${(historiaData.antecedentesClinico?.antecedentesQuirurgicos || historiaData.informacionMedica?.antecedentesQuirurgicos) || 'No registrados'}
        </div>
        <div>
          <strong>Antecedentes Alérgicos:</strong><br>
          ${(historiaData.antecedentesClinico?.antecedentesAlergicos || historiaData.informacionMedica?.antecedentesAlergicos) || 'No registrados'}
        </div>
      </div>
    </div>
  `;
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

  return `
    <div class="section-header">
      ${consulta.tipo} #${consulta.numero} - ${fechaConsulta}
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; page-break-inside: avoid;">
      <tr>
        <td class="label-cell" style="width: 18%;">Médico:</td>
        <td class="value-cell" style="width: 32%;">${consulta.medico || 'N/A'}</td>
        <td class="label-cell" style="width: 18%;">Especialidad:</td>
        <td class="value-cell" style="width: 32%;">${consulta.especialidad || 'N/A'}</td>
      </tr>
      ${consulta.motivo && consulta.motivo !== 'N/A' ? `
      <tr>
        <td class="label-cell">Motivo:</td>
        <td class="value-cell" colspan="3">${consulta.motivo}</td>
      </tr>
      ` : ''}
      ${consulta.enfermedadActual && consulta.enfermedadActual !== 'N/A' ? `
      <tr>
        <td class="label-cell">Enfermedad Actual:</td>
        <td class="value-cell" colspan="3">${consulta.enfermedadActual}</td>
      </tr>
      ` : ''}
      ${consulta.examenFisico && consulta.examenFisico !== 'N/A' ? `
      <tr>
        <td class="label-cell">Examen Físico:</td>
        <td class="value-cell" colspan="3">${consulta.examenFisico}</td>
      </tr>
      ` : ''}
      ${consulta.signosVitales && consulta.signosVitales !== 'N/A' ? `
      <tr>
        <td class="label-cell">Signos Vitales:</td>
        <td class="value-cell" colspan="3">${consulta.signosVitales}</td>
      </tr>
      ` : ''}
      ${consulta.diagnosticos && consulta.diagnosticos !== 'N/A' ? `
      <tr>
        <td class="label-cell">Diagnóstico:</td>
        <td class="value-cell" colspan="3"><strong>${consulta.diagnosticos}</strong></td>
      </tr>
      ` : ''}
      ${consulta.planTratamiento && consulta.planTratamiento !== 'N/A' ? `
      <tr>
        <td class="label-cell">Plan:</td>
        <td class="value-cell" colspan="3">${consulta.planTratamiento}</td>
      </tr>
      ` : ''}
      ${consulta.formulaMedica && consulta.formulaMedica !== 'N/A' ? `
      <tr>
        <td class="label-cell">Fórmula Médica:</td>
        <td class="value-cell" colspan="3">${consulta.formulaMedica}</td>
      </tr>
      ` : ''}
      ${consulta.indicaciones && consulta.indicaciones !== 'N/A' ? `
      <tr>
        <td class="label-cell">Indicaciones:</td>
        <td class="value-cell" colspan="3">${consulta.indicaciones}</td>
      </tr>
      ` : ''}
    </table>
    
    <div style="text-align: center; margin: 15px 0; padding: 8px; border: 1px solid #000; font-size: 9px;">
      <strong>Firmado Electrónicamente: ${consulta.medico || 'N/A'}</strong>
    </div>
  `;
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

  // Estilos CSS para impresión en formato tabla
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
          font-weight: 600; 
          color: #374151; 
          border-bottom: 1px solid #e5e7eb; 
          padding-bottom: 2px; 
          font-size: 11px; 
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
