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
 * Genera el encabezado HTML para historias clínicas
 * @param {string} numeroHistoria - Número de la historia clínica
 * @param {Object} config - Configuración de la IPS
 * @returns {string} HTML del encabezado
 */
const generarEncabezadoHTML = (numeroHistoria, config) => {
  const fechaHoraActual = `${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`;
  
  return `
    <div class="header">
      <div class="institution-info">
        <h1 style="color: ${config.colores?.primario || '#1e40af'}; margin: 0; font-size: 20px; font-weight: bold;">${config.nombre || 'IPS'}</h1>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">${config.descripcion || ''}</p>
        <p style="margin: 2px 0; color: #6b7280;">NIT: ${config.nit || 'N/A'} • Dirección: ${config.direccion || 'N/A'}, ${config.ciudad || ''}</p>
        <p style="margin: 2px 0; color: #6b7280;">Teléfonos: ${config.telefono || 'N/A'} • Email: ${config.email || 'N/A'}</p>
      </div>
      <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">HISTORIA CLÍNICA ELECTRÓNICA</h2>
      <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Número de Historia Clínica: ${numeroHistoria}</p>
      <p style="margin: 2px 0; color: #6b7280;">Fecha de Impresión: ${fechaHoraActual}</p>
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
    <div class="footer">
      <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
        <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🔒 PROTECCIÓN DE DATOS PERSONALES</h5>
        <p style="margin: 0; font-size: 8px; line-height: 1.2;">
          ${config.notasLegales?.historiaClinica || 'Los datos contenidos en este documento son confidenciales y están protegidos por la Ley 1581 de 2012 de Protección de Datos Personales de Colombia.'}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <p style="margin: 0; font-size: 9px;"><strong>Documento generado por:</strong></p>
          <p style="margin: 2px 0; font-size: 9px;">${config.servicios?.historiaClinicaElectronica || config.nombre || 'Sistema de Historia Clínica Electrónica'}</p>
          <p style="margin: 2px 0; font-size: 9px;">Versión ${config.version || '1.0'}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 9px;"><strong>Fecha y hora de generación:</strong></p>
          <p style="margin: 2px 0; font-size: 9px;">${fechaHoraActual}</p>
          <p style="margin: 2px 0; font-size: 9px;">Usuario: Sistema Automatizado</p>
        </div>
      </div>

      <div style="background: #fef2f2; padding: 8px; border-radius: 3px; border: 1px solid #fecaca;">
        <h5 style="margin: 0 0 5px 0; color: #dc2626; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
        <p style="margin: 0; font-size: 8px; line-height: 1.2;">
          <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
          <strong>Ley 1581 de 2012:</strong> Protección de Datos Personales<br>
          <strong>Decreto 1377 de 2013:</strong> Reglamentación de la Ley 1581<br>
          <strong>Ley 1751 de 2015:</strong> Derechos y deberes de los usuarios en salud<br>
          <strong>Resolución 1995 de 1999:</strong> Historia Clínica<br>
          <strong>Decreto 780 de 2016:</strong> Historia Clínica Electrónica
        </p>
      </div>

      <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 8px; color: #9ca3af;">
          Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a historias clínicas.
          Cualquier modificación debe ser autorizada por el profesional responsable.
        </p>
      </div>
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
  
  const patientName = [
    patientInfo.primerNombre,
    patientInfo.segundoNombre,
    patientInfo.primerApellido,
    patientInfo.segundoApellido
  ].filter(Boolean).join(' ') || 'N/A';

  return `
    <!-- Información del Paciente -->
    <div class="patient-info">
      <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">
        INFORMACIÓN DEL PACIENTE
      </h3>
      <div class="grid-2">
        <div><strong>Nombre Completo:</strong> ${patientName}</div>
        <div><strong>Tipo y Número de Documento:</strong> ${patient?.tipoDocumento || 'N/A'} ${patient?.numeroDocumento || 'N/A'}</div>
        <div><strong>Fecha de Nacimiento:</strong> ${formatDate(patientInfo.fechaNacimiento)}</div>
        <div><strong>Edad:</strong> ${calcularEdad(patientInfo.fechaNacimiento)}</div>
        <div><strong>Sexo:</strong> ${patientInfo.genero || 'N/A'}</div>
        <div><strong>Estado Civil:</strong> ${patientInfo.estadoCivil || 'N/A'}</div>
        <div><strong>Dirección:</strong> ${patientContact.direccion || 'N/A'}</div>
        <div><strong>Ciudad:</strong> ${patientContact.ciudad || 'N/A'}, ${patientContact.departamento || 'N/A'}</div>
        <div><strong>Teléfono:</strong> ${patientContact.telefono || 'N/A'}</div>
        <div><strong>Email:</strong> ${patientContact.email || 'N/A'}</div>
        <div><strong>Ocupación:</strong> ${patientInfo.ocupacion || 'N/A'}</div>
        <div><strong>Nivel Educativo:</strong> ${patientInfo.nivelEducativo || 'N/A'}</div>
      </div>
    </div>

    <!-- Información Médica Básica -->
    <div class="patient-info">
      <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">
        INFORMACIÓN MÉDICA BÁSICA
      </h3>
      <div class="grid-3">
        <div><strong>Tipo de Sangre:</strong> ${patientMedical.tipoSangre || patientInfo.tipoSangre || 'N/A'}</div>
        <div><strong>EPS:</strong> ${patientMedical.eps || patientMedical.regimenAfiliacion || 'NUEVA EPS'}</div>
        <div><strong>Tipo de Seguro:</strong> ${patientMedical.tipoSeguro || 'N/A'}</div>
      </div>
      <div style="margin-top: 10px;">
        <div><strong>Alergias:</strong> ${patientMedical.alergias || 'NINGUNA'}</div>
        <div style="margin-top: 5px;"><strong>Medicamentos Actuales:</strong> ${patientMedical.medicamentosActuales || 'NINGUNO'}</div>
      </div>
    </div>
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
  const fechaActual = new Date().toLocaleDateString('es-CO');

  return `
    <div class="consulta">
      <div class="consulta-header">
        <h4 style="margin: 0; color: #1f2937; font-size: 14px;">${consulta.tipo} #${consulta.numero}</h4>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
          <p style="margin: 0; color: #6b7280; font-size: 11px;">
            <strong>Fecha:</strong> ${formatDate(consulta.fecha)}
            ${formatTime(consulta.fecha) ? ` | <strong>Hora:</strong> ${formatTime(consulta.fecha)}` : ''}
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 10px;">
            <strong>Historia Clínica:</strong> ${numeroHistoria}
          </p>
        </div>
      </div>

      <!-- Información del Médico -->
      <div class="section">
        <div class="section-title">👨‍⚕️ INFORMACIÓN DEL PROFESIONAL DE LA SALUD</div>
        <div class="grid-2">
          <div><span class="field-label">Médico Tratante:</span> ${consulta.medico || 'N/A'}</div>
          <div><span class="field-label">Especialidad:</span> ${consulta.especialidad || 'N/A'}</div>
          <div><span class="field-label">Registro Médico:</span> ${consulta.registroMedico || 'N/A'}</div>
          <div><span class="field-label">Tipo de Consulta:</span> ${consulta.tipo || 'Consulta General'}</div>
        </div>
      </div>

      <!-- Anamnesis -->
      <div class="section">
        <div class="section-title">📝 ANAMNESIS</div>
        ${consulta.motivo && consulta.motivo !== 'N/A' ? `
        <div class="field">
          <span class="field-label">Motivo de Consulta:</span>
          <div style="margin-top: 3px; padding: 6px; background: #f8fafc; border-radius: 3px; border-left: 3px solid #3b82f6;">
            ${consulta.motivo}
          </div>
        </div>
        ` : ''}

        ${consulta.enfermedadActual && consulta.enfermedadActual !== 'N/A' ? `
        <div class="field">
          <span class="field-label">Enfermedad Actual:</span>
          <div style="margin-top: 3px; padding: 6px; background: #fef3c7; border-radius: 3px; border-left: 3px solid #f59e0b;">
            ${consulta.enfermedadActual}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Examen Clínico -->
      ${(consulta.examenFisico && consulta.examenFisico !== 'N/A') || (consulta.signosVitales && consulta.signosVitales !== 'N/A') ? `
      <div class="section">
        <div class="section-title">🔍 EXAMEN CLÍNICO</div>
        <div class="grid-2">
          ${consulta.examenFisico && consulta.examenFisico !== 'N/A' ? `
          <div>
            <span class="field-label">Examen Físico:</span><br>
            <span style="padding: 4px; background: #ecfdf5; border-radius: 3px; display: inline-block; margin-top: 2px;">
              ${consulta.examenFisico}
            </span>
          </div>
          ` : '<div></div>'}
          ${consulta.signosVitales && consulta.signosVitales !== 'N/A' ? `
          <div>
            <span class="field-label">Signos Vitales:</span><br>
            <span style="padding: 4px; background: #ecfdf5; border-radius: 3px; display: inline-block; margin-top: 2px;">
              ${consulta.signosVitales}
            </span>
          </div>
          ` : '<div></div>'}
        </div>
      </div>
      ` : ''}

      <!-- Diagnóstico -->
      ${(consulta.diagnosticos && consulta.diagnosticos !== 'N/A') || (consulta.planTratamiento && consulta.planTratamiento !== 'N/A') ? `
      <div class="section">
        <div class="section-title">💊 DIAGNÓSTICO Y TRATAMIENTO</div>
        ${consulta.diagnosticos && consulta.diagnosticos !== 'N/A' ? `
        <div class="field">
          <span class="field-label">Diagnósticos CIE-10:</span>
          <div style="margin-top: 3px; padding: 8px; background: #fee2e2; border-radius: 3px; border-left: 4px solid #dc2626; font-family: monospace;">
            ${consulta.diagnosticos}
          </div>
        </div>
        ` : ''}

        ${consulta.planTratamiento && consulta.planTratamiento !== 'N/A' ? `
        <div class="field">
          <span class="field-label">Plan de Manejo:</span>
          <div style="margin-top: 3px; padding: 8px; background: #f0f9ff; border-radius: 3px; border-left: 4px solid #2563eb;">
            ${consulta.planTratamiento}
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Órdenes Médicas -->
      ${consulta.formulaMedica && consulta.formulaMedica !== 'N/A' ? `
      <div class="section">
        <div class="section-title">📋 ÓRDENES MÉDICAS</div>
        <div style="padding: 10px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 5px;">
          <strong style="color: #dc2626;">💊 FORMULA MÉDICA:</strong><br>
          <div style="margin-top: 5px; padding: 8px; background: white; border-radius: 3px; font-family: monospace; white-space: pre-line;">
            ${consulta.formulaMedica}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Incapacidad -->
      ${consulta.incapacidad?.tipo || consulta.incapacidad?.dias ? `
      <div class="section">
        <div class="section-title">📄 INCAPACIDAD MÉDICA</div>
        <div class="important-note">
          <strong>⚠️ INCAPACIDAD CERTIFICADA</strong><br>
          ${consulta.incapacidad.tipo ? `<strong>Tipo:</strong> ${consulta.incapacidad.tipo}<br>` : ''}
          ${consulta.incapacidad.dias ? `<strong>Días:</strong> ${consulta.incapacidad.dias}` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Seguimiento y Recomendaciones -->
      ${(consulta.indicaciones && consulta.indicaciones !== 'N/A') || (consulta.proximaCita && consulta.proximaCita !== 'N/A') || (consulta.observaciones && consulta.observaciones !== 'N/A') ? `
      <div class="section">
        <div class="section-title">📅 SEGUIMIENTO Y RECOMENDACIONES</div>
        <div class="grid-2">
          ${consulta.indicaciones && consulta.indicaciones !== 'N/A' ? `
          <div>
            <span class="field-label">Indicaciones:</span><br>
            <span style="padding: 4px; background: #f0fdf4; border-radius: 3px; display: inline-block; margin-top: 2px;">
              ${consulta.indicaciones}
            </span>
          </div>
          ` : '<div></div>'}
          ${consulta.proximaCita && consulta.proximaCita !== 'N/A' ? `
          <div>
            <span class="field-label">Próxima Cita:</span><br>
            <span style="padding: 4px; background: #fef3c7; border-radius: 3px; display: inline-block; margin-top: 2px; font-weight: bold;">
              ${consulta.proximaCita}
            </span>
          </div>
          ` : '<div></div>'}
        </div>

        ${consulta.observaciones && consulta.observaciones !== 'N/A' ? `
        <div class="field" style="margin-top: 10px;">
          <span class="field-label">Observaciones:</span>
          <div style="margin-top: 3px; padding: 8px; background: #f9fafb; border-radius: 3px; border: 1px solid #e5e7eb;">
            ${consulta.observaciones}
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Firma y Sello -->
      <div style="margin-top: 25px; display: flex; justify-content: space-between; gap: 15px; page-break-inside: avoid;">
        <!-- Firma Digital del Profesional -->
        <div style="flex: 1; padding: 12px; background: white; border: 1.5px solid #000; border-radius: 3px;">
          <div style="text-align: center; border-bottom: 1px solid #666; padding-bottom: 6px; margin-bottom: 12px;">
            <strong style="font-size: 10px; color: #000;">✍️ FIRMA DEL PROFESIONAL</strong>
          </div>

          ${consulta.firmaDigital || consulta.medico ? `
            <!-- Línea de firma -->
            <div style="border-top: 1.5px solid #000; width: 180px; margin: 20px auto 10px;"></div>

            <!-- Información del profesional -->
            <div style="text-align: center;">
              <p style="margin: 3px 0; font-weight: bold; font-size: 11px; color: #000;">
                ${consulta.firmaDigital?.nombreMedico || consulta.medico || 'Profesional de la Salud'}
              </p>

              ${consulta.firmaDigital?.registroProfesional ? `
              <p style="margin: 2px 0; font-size: 9px; color: #333;">
                Reg. Prof.: ${consulta.firmaDigital.registroProfesional}
              </p>
              ` : ''}

              ${consulta.firmaDigital?.especialidad || consulta.especialidad ? `
              <p style="margin: 2px 0; font-size: 9px; color: #555;">
                ${consulta.firmaDigital?.especialidad || consulta.especialidad}
              </p>
              ` : ''}

              <p style="margin: 8px 0 2px 0; font-size: 8px; color: #666;">
                Fecha: ${consulta.firmaDigital?.fechaFirma || formatDate(consulta.fecha) || fechaActual}
              </p>

              ${consulta.firmaDigital?.selloDigital ? `
              <p style="margin: 2px 0; font-size: 7px; color: #888; font-style: italic;">
                Firmado digitalmente
              </p>
              ` : ''}
            </div>
          ` : `
            <!-- Espacio para firma manual -->
            <div style="margin-top: 50px;"></div>
            <div style="border-top: 1.5px solid #000; width: 180px; margin: 0 auto 8px;"></div>
            <div style="text-align: center;">
              <p style="margin: 3px 0; font-size: 9px; color: #333;">
                Firma del Profesional Responsable
              </p>
              <p style="margin: 8px 0 2px 0; font-size: 8px; color: #666;">
                Fecha: ${fechaActual}
              </p>
            </div>
          `}
        </div>

        <!-- Sello de la Institución -->
        <div style="flex: 1; padding: 12px; background: white; border: 1.5px solid #000; border-radius: 3px;">
          <div style="text-align: center; border-bottom: 1px solid #666; padding-bottom: 6px; margin-bottom: 12px;">
            <strong style="font-size: 10px; color: #000;">🏛️ SELLO DE LA INSTITUCIÓN</strong>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <div style="padding: 10px; border: 1px solid #d1d5db; border-radius: 3px; background: white; display: inline-block;">
              <p style="margin: 0 0 10px 0; font-size: 9px; color: #6b7280; font-weight: bold;">SELLO OFICIAL</p>
              <div style="margin: 10px auto; width: 80px; height: 60px; border: 1px dashed #9ca3af;"></div>
              <p style="margin: 10px 0 0 0; font-size: 8px; color: #9ca3af;">${config.nombre}</p>
            </div>
          </div>
        </div>
      </div>
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

  // Estilos CSS para impresión
  const styles = `
    <style>
      @media print {
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 12px; 
          font-size: 10px; 
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
        .patient-info { 
          background: #f8fafc; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 12px; 
          border: 1px solid #e5e7eb; 
        }
        .medical-antecedents { 
          background: #fef3c7; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 12px; 
          border-left: 3px solid #f59e0b; 
        }
        .consulta { 
          border: 1px solid #e5e7eb; 
          padding: 8px; 
          margin-bottom: 12px; 
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
      ${generarAntecedentesHTML(historiaData)}
      ${generarConsentimientoHTML()}

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
