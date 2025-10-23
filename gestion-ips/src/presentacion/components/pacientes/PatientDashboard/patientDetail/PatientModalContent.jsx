import React from 'react';
import {
  PhoneIcon,
  IdentificationIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Importar utilidades
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

// Importar componentes extraídos para clean code
import PatientPersonalInfo from './PatientPersonalInfo.jsx';
import PatientContactInfo from './PatientContactInfo.jsx';
import PatientMedicalInfo from './PatientMedicalInfo.jsx';
import PatientConsentInfo from './PatientConsentInfo.jsx';
import PatientClinicalHistory from './PatientClinicalHistory.jsx';
import PatientClinicalHistoryComplete from './PatientClinicalHistoryComplete.jsx';

/**
 * Componente que maneja el contenido de cada pestaña del modal de detalles del paciente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Object} props.patient - Datos del paciente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @param {Object} props.historiaClinica - Historia clínica del paciente
 * @param {Array} props.consultas - Lista de consultas
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.setActiveTab - Función para cambiar pestaña
 * @returns {JSX.Element} Contenido de la pestaña activa
 */
const PatientModalContent = ({
  activeTab,
  patient,
  patientData,
  historiaClinica,
  consultas,
  loading,
  setActiveTab
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      {/* Información Personal */}
      {activeTab === 'personal' && (
        <PatientPersonalInfo
          patientData={patientData}
          patient={patient}
        />
      )}

      {/* Información de Contacto */}
      {activeTab === 'contacto' && (
        <PatientContactInfo patientData={patientData} />
      )}

      {/* Información Médica */}
      {activeTab === 'medica' && (
        <PatientMedicalInfo patientData={patientData} />
      )}

      {/* Contacto de Emergencia */}
      {activeTab === 'emergencia' && (
        <div className="patient-detail-container">
          <h4 className="patient-detail-header">Contacto de Emergencia</h4>
          <div className="patient-detail-section">
            <div className="patient-detail-card-red">
              <div className="patient-emergency-info">
                <IdentificationIcon className="h-5 w-5 text-red-600" />
                <h5 className="patient-emergency-title">Información de Emergencia</h5>
              </div>
              <div className="patient-emergency-grid patient-detail-max-width-none">
                <div className="patient-emergency-field">
                  <div>
                    <p className="patient-emergency-label">Nombre Completo</p>
                    <p className="patient-emergency-value">{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="patient-emergency-label">Relación</p>
                    <p className="font-medium text-red-800">{patientData.contactoEmergencia?.relacion || 'N/A'}</p>
                  </div>
                </div>
                <div className="patient-emergency-field">
                  <div className="patient-emergency-contact">
                    <PhoneIcon className="patient-emergency-phone-primary" />
                    <div>
                      <p className="patient-emergency-phone-label">Teléfono Principal</p>
                      <p className="patient-emergency-phone-value">{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="patient-emergency-contact">
                    <PhoneIcon className="patient-emergency-phone-secondary" />
                    <div>
                      <p className="patient-emergency-phone-label">Teléfono Secundario</p>
                      <p className="font-medium text-red-800">{patientData.contactoEmergencia?.telefonoContactoSecundario || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consentimiento Informado */}
      {activeTab === 'consentimiento' && (
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
      )}

      {/* Historia Clínica */}
      {activeTab === 'clinica' && (
        <PatientClinicalHistory
          historiaClinica={historiaClinica}
          consultas={consultas}
          setActiveTab={setActiveTab}
          formatDate={formatDate}
        />
      )}

      {/* Historia Clínica Completa */}
      {activeTab === 'clinica_completa' && historiaClinica && (
        <PatientClinicalHistoryComplete
          historiaClinica={historiaClinica}
          consultas={consultas}
          setActiveTab={setActiveTab}
          patient={patient}
          patientData={patientData}
        />
      )}
    </div>
  );
};

export default PatientModalContent;