import React from 'react';
import {
  UserIcon,
  PhoneIcon,
  HeartIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

// Importar utilidades
import { formatDate, calculateAge } from '../../../../negocio/utils/pacientes/patientModalUtils.js';
import { printHistoriaClinica, printConsulta } from '../../../../negocio/utils/pacientes/printUtils.js';

// Importar componentes extraídos para clean code
import PatientPersonalInfo from './PatientPersonalInfo.jsx';
import PatientContactInfo from './PatientContactInfo.jsx';
import PatientMedicalInfo from './PatientMedicalInfo.jsx';
import PatientEmergencyContact from './PatientEmergencyContact.jsx';
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
    <div className="space-y-6">
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
        <div className="space-y-6">
          {/* Información básica médica - 3 columnas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Información Médica Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">EPS:</span>
                <span className="font-semibold text-gray-900">{patientData.informacionMedica?.eps || 'NUEVA EPS'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Régimen:</span>
                <span className="font-semibold text-gray-900">{patientData.informacionMedica?.regimenAfiliacion || 'CONTRIBUTIVO'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Tipo de Sangre:</span>
                <span className="font-semibold text-gray-900">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Antecedentes médicos - 2 columnas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Antecedentes Médicos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-gray-600 font-medium block mb-2">Antecedentes Personales:</span>
                <p className="font-medium min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.antecedentesPersonales || 'No registrados'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium block mb-2">Antecedentes Familiares:</span>
                <p className="font-medium min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.antecedentesFamiliares || 'No registrados'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium block mb-2">Antecedentes Quirúrgicos:</span>
                <p className="font-medium min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.antecedentesQuirurgicos || 'No registrados'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium block mb-2">Antecedentes Alérgicos:</span>
                <p className="font-medium min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.antecedentesAlergicos || 'No registrados'}
                </p>
              </div>
            </div>
          </div>

          {/* Información actual - 3 columnas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Información Actual</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-gray-600 font-medium block mb-2">Alergias:</span>
                <p className="font-medium text-yellow-800 min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.alergias || 'NINGUNA'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium block mb-2">Medicamentos Actuales:</span>
                <p className="font-medium text-blue-800 min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.medicamentosActuales || 'NINGUNA'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium block mb-2">Observaciones Médicas:</span>
                <p className="font-medium min-h-[80px] leading-relaxed">
                  {patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contacto de Emergencia */}
      {activeTab === 'emergencia' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto de Emergencia</h4>
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-3">
                <IdentificationIcon className="h-5 w-5 text-red-600" />
                <h5 className="font-semibold text-red-900">Información de Emergencia</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Nombre Completo</p>
                    <p className="font-semibold text-lg text-red-900">{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-medium">Relación</p>
                    <p className="font-medium text-red-800">{patientData.contactoEmergencia?.relacion || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-red-700 font-medium">Teléfono Principal</p>
                      <p className="font-semibold text-red-900">{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-red-700 font-medium">Teléfono Secundario</p>
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
      )}

      {/* Historia Clínica */}
      {activeTab === 'clinica' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Historia Clínica</h4>
            {historiaClinica && (
              <button
                onClick={() => setActiveTab('clinica_completa')}
                className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Ver Historia Clínica Completa
              </button>
            )}
          </div>

          {!historiaClinica ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historia clínica</h3>
              <p className="mt-1 text-sm text-gray-500">
                Este paciente aún no tiene una historia clínica registrada.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información de la Historia */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Información General</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ maxWidth: 'none' }}>
                  <div>
                    <span className="text-blue-700">Número de Historia:</span>
                    <p className="font-medium">{historiaClinica.numeroHistoria}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Fecha de Apertura:</span>
                    <p className="font-medium">{formatDate(historiaClinica.fechaApertura)}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Estado:</span>
                    <p className="font-medium">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </div>
              </div>

              {/* Consultas Médicas */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-4">Consultas Médicas ({consultas.length})</h5>

                {consultas.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consultas.map((consulta, index) => (
                      <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Consulta #{consulta.id}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(consulta.fechaCreacion)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Creada</p>
                            <p className="text-sm font-medium">{formatDate(consulta.fechaCreacion)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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