import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, calculateAge } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para mostrar la información personal del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientPersonalInfo = ({ patientData, patient }) => {
  return (
    <div className="patient-personal-grid patient-detail-max-width-none">
      <div className="patient-personal-section">
        <h4 className="patient-detail-header">Datos Personales</h4>
        <div className="patient-personal-fields">
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Primer Nombre:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.primerNombre || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Segundo Nombre:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.segundoNombre || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Primer Apellido:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.primerApellido || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Segundo Apellido:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.segundoApellido || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Fecha de Nacimiento:</span>
            <span className="patient-detail-text-value">{formatDate(patientData.informacionPersonal?.fechaNacimiento)}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Edad:</span>
            <span className="patient-detail-text-value">{calculateAge(patientData.informacionPersonal?.fechaNacimiento)}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Género:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.genero || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Estado Civil:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.estadoCivil || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Tipo de Sangre:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Nacionalidad:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.nacionalidad || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Estrato Socioeconómico:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.estratoSocioeconomico || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Grupo Étnico:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.grupoEtnico || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Discapacidad:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.discapacidad || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Ocupación:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.ocupacion || 'N/A'}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Nivel Educativo:</span>
            <span className="patient-detail-text-value">{patientData.informacionPersonal?.nivelEducativo || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="patient-personal-system-section">
        <h4 className="patient-personal-system-header">Información del Sistema</h4>
        <div className="patient-personal-system-fields">
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">ID del Paciente:</span>
            <span className="patient-detail-text-value">{patient?.id}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Tipo Documento:</span>
            <span className="patient-detail-text-value">{patient?.tipoDocumento}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Número Documento:</span>
            <span className="patient-detail-text-value">{patient?.numeroDocumento}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Estado:</span>
            <span className={`patient-detail-text-value ${patient?.activo ? 'patient-personal-status-active' : 'patient-personal-status-inactive'}`}>
              {patient?.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Fecha Registro:</span>
            <span className="patient-detail-text-value">{formatDate(patient?.fechaCreacion)}</span>
          </div>
          <div className="patient-personal-field">
            <span className="patient-detail-text-label">Última Actualización:</span>
            <span className="patient-detail-text-value">{formatDate(patient?.fechaActualizacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
PatientPersonalInfo.propTypes = {
  patientData: PropTypes.shape({
    informacionPersonal: PropTypes.object,
  }),
  patient: PropTypes.object,
};

export default PatientPersonalInfo;
