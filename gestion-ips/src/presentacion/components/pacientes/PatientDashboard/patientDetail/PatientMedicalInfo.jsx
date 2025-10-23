import React from 'react';
import PropTypes from 'prop-types';
import { BuildingOfficeIcon, HeartIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la información médica del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientMedicalInfo = ({ patientData }) => {
  return (
    <div className="patient-detail-container">
      <h4 className="patient-detail-header">Información Médica</h4>
      <div className="patient-detail-section">
        {/* Información básica médica */}
        <div className="patient-medical-basic patient-detail-max-width-none">
          <div className="patient-medical-field">
            <BuildingOfficeIcon className="patient-detail-icon-gray" />
            <div>
              <p className="patient-detail-text-small">EPS</p>
              <p className="patient-detail-text-value">{patientData.informacionMedica?.eps || 'N/A'}</p>
            </div>
          </div>
          <div className="patient-medical-field">
            <HeartIcon className="patient-detail-icon-gray" />
            <div>
              <p className="patient-detail-text-small">Régimen de Afiliación</p>
              <p className="patient-detail-text-value">{patientData.informacionMedica?.regimenAfiliacion || 'N/A'}</p>
            </div>
          </div>
          <div className="patient-medical-field">
            <HeartIcon className="patient-detail-icon-red" />
            <div>
              <p className="patient-detail-text-small">Tipo de Sangre</p>
              <p className="patient-detail-text-value">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Antecedentes médicos */}
        <div className="patient-detail-card-gray">
          <h5 className="patient-detail-subheader">Antecedentes Médicos</h5>
          <div className="patient-medical-antecedents">
            <div>
              <p className="patient-detail-text-small mb-2">Antecedentes Personales</p>
              <p className="patient-medical-antecedent-item">
                {patientData.informacionMedica?.antecedentesPersonales || 'No registrados'}
              </p>
            </div>
            <div>
              <p className="patient-detail-text-small mb-2">Antecedentes Familiares</p>
              <p className="patient-medical-antecedent-item">
                {patientData.informacionMedica?.antecedentesFamiliares || 'No registrados'}
              </p>
            </div>
            <div>
              <p className="patient-detail-text-small mb-2">Enfermedades Crónicas</p>
              <p className="patient-medical-antecedent-item patient-detail-min-height-60">
                {patientData.informacionMedica?.enfermedadesCronicas || 'Ninguna registrada'}
              </p>
            </div>
            <div>
              <p className="patient-detail-text-small mb-2">Vacunas e Inmunizaciones</p>
              <p className="patient-medical-antecedent-item patient-detail-min-height-60">
                {patientData.informacionMedica?.vacunas || 'No registradas'}
              </p>
            </div>
          </div>
        </div>

        {/* Información actual */}
        <div className="patient-medical-current">
          <div>
            <p className="patient-detail-text-small mb-2">Alergias</p>
            <p className="patient-medical-current-item">
              {patientData.informacionMedica?.alergias || 'Ninguna registrada'}
            </p>
          </div>
          <div>
            <p className="patient-detail-text-small mb-2">Medicamentos Actuales</p>
            <p className="patient-medical-current-item-blue">
              {patientData.informacionMedica?.medicamentosActuales || 'Ninguno registrado'}
            </p>
          </div>
        </div>

        <div>
          <p className="patient-detail-text-small mb-2">Observaciones Médicas Adicionales</p>
          <p className="patient-medical-observations">
            {patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}
          </p>
        </div>
      </div>
    </div>
  );
};

PatientMedicalInfo.propTypes = {
  patientData: PropTypes.shape({
    informacionMedica: PropTypes.shape({
      eps: PropTypes.string,
      regimenAfiliacion: PropTypes.string,
      antecedentesPersonales: PropTypes.string,
      antecedentesFamiliares: PropTypes.string,
      enfermedadesCronicas: PropTypes.string,
      vacunas: PropTypes.string,
      alergias: PropTypes.string,
      medicamentosActuales: PropTypes.string,
      observacionesMedicas: PropTypes.string,
    }),
    informacionPersonal: PropTypes.shape({
      tipoSangre: PropTypes.string,
    }),
  }),
};

export default PatientMedicalInfo;