import React from 'react';
import PropTypes from 'prop-types';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la información de consentimiento informado del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientConsentInfo = ({ patientData, formatDate }) => {
  return (
    <div className="patient-detail-container">
      <h4 className="patient-detail-header">Consentimiento Informado</h4>

      <div className="patient-detail-card-blue">
        <div className="patient-consent-header">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          <h5 className="patient-consent-title">Consentimiento para Tratamiento Médico</h5>
        </div>

        <div className="space-y-4">
          <div className="patient-detail-card">
            <h6 className="font-semibold text-gray-900 mb-3">Consentimientos Otorgados</h6>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tratamiento Médico:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaTratamiento
                    ? 'patient-detail-status-accepted'
                    : 'patient-detail-status-rejected'
                }`}>
                  {patientData.consentimientoInformado?.aceptaTratamiento ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Privacidad de Datos (Ley 1581):</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaPrivacidad
                    ? 'patient-detail-status-accepted'
                    : 'patient-detail-status-rejected'
                }`}>
                  {patientData.consentimientoInformado?.aceptaPrivacidad ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tratamiento Datos Sensibles:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaDatosPersonales
                    ? 'patient-detail-status-accepted'
                    : 'patient-detail-status-rejected'
                }`}>
                  {patientData.consentimientoInformado?.aceptaDatosPersonales ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Uso de Imágenes:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaImagenes
                    ? 'patient-detail-status-accepted'
                    : 'patient-detail-status-optional'
                }`}>
                  {patientData.consentimientoInformado?.aceptaImagenes ? '✓ Aceptado' : '○ Opcional'}
                </span>
              </div>
            </div>
          </div>

          <div className="patient-detail-card">
            <h6 className="font-semibold text-gray-900 mb-3">Información Legal</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Fecha de Consentimiento:</span>
                <p className="font-medium">{formatDate(patientData.consentimientoInformado?.fechaConsentimiento) || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Testigo:</span>
                <p className="font-medium">{patientData.consentimientoInformado?.testigoConsentimiento || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="patient-detail-card-yellow">
            <div className="patient-consent-legal">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h6 className="font-semibold text-yellow-900 mb-2">Información Legal Importante</h6>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• Este consentimiento cumple con la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales)</p>
                  <p>• El paciente ha sido informado sobre sus derechos y deberes según la <strong>Ley 1751 de 2015</strong></p>
                  <p>• Los datos médicos sensibles están protegidos por la normatividad colombiana</p>
                  <p>• El paciente puede revocar este consentimiento en cualquier momento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

PatientConsentInfo.propTypes = {
  patientData: PropTypes.shape({
    consentimientoInformado: PropTypes.shape({
      aceptaTratamiento: PropTypes.bool,
      aceptaPrivacidad: PropTypes.bool,
      aceptaDatosPersonales: PropTypes.bool,
      aceptaImagenes: PropTypes.bool,
      fechaConsentimiento: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      testigoConsentimiento: PropTypes.string
    })
  }),
  formatDate: PropTypes.func.isRequired
};

PatientConsentInfo.defaultProps = {
  patientData: {}
};


export default PatientConsentInfo;