/**
 * patientInfo.js
 * 
 * Generador de información del paciente para documentos HTML
 */

import { calcularEdad } from './formatters.js';

/**
 * Genera información del paciente en formato HTML
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @returns {string} HTML con información del paciente
 */
export const generarInfoPacienteHTML = (patient, patientData) => {
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
