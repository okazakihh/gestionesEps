import React from 'react';
import {
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para la pestaña de consentimiento informado del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @returns {JSX.Element} Contenido de la pestaña de consentimiento
 */
const PatientConsentInfoTab = ({ patientData }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Consentimiento Informado</h4>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          <h5 className="text-xl font-semibold text-blue-900">Consentimiento para Tratamiento Médico</h5>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h6 className="font-semibold text-gray-900 mb-3">Consentimientos Otorgados</h6>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tratamiento Médico:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaTratamiento
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patientData.consentimientoInformado?.aceptaTratamiento ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Privacidad de Datos (Ley 1581):</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaPrivacidad
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patientData.consentimientoInformado?.aceptaPrivacidad ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tratamiento Datos Sensibles:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaDatosPersonales
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patientData.consentimientoInformado?.aceptaDatosPersonales ? '✓ Aceptado' : '✗ No aceptado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Uso de Imágenes:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.consentimientoInformado?.aceptaImagenes
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {patientData.consentimientoInformado?.aceptaImagenes ? '✓ Aceptado' : '○ Opcional'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
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

          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <div className="flex items-start space-x-3">
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
  );
};

export default PatientConsentInfoTab;