import React from 'react';
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  HeartIcon,
  IdentificationIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../../../../negocio/utils/pacientes/patientModalUtils.js';
import { printHistoriaClinica, printConsulta } from '../../../../negocio/utils/pacientes/printUtils.js';

/**
 * Componente para la pestaña completa de historia clínica del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.historiaClinica - Historia clínica del paciente
 * @param {Array} props.consultas - Lista de consultas
 * @param {Object} props.patientData - Datos parseados del paciente
 * @param {Object} props.patient - Datos del paciente
 * @param {Function} props.setActiveTab - Función para cambiar pestaña
 * @returns {JSX.Element} Contenido de la pestaña completa de historia clínica
 */
const PatientClinicalHistoryCompleteTab = ({
  historiaClinica,
  consultas,
  patientData,
  patient,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Historia Clínica Completa</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => printHistoriaClinica(consultas, historiaClinica)}
            className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Imprimir historia clínica completa"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir HC
          </button>
          <button
            onClick={() => setActiveTab('clinica')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Completa de la Historia */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h5 className="font-semibold text-gray-900 mb-6 text-lg border-b pb-2">Información General de la Historia Clínica</h5>

          {/* Header con información básica */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Número de Historia:</span>
              <p className="font-semibold text-gray-900 text-lg">{historiaClinica.numeroHistoria}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Fecha de Apertura:</span>
              <p className="font-medium text-gray-900">{formatDate(historiaClinica.fechaApertura)}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Estado:</span>
              <p className="font-medium text-gray-900">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Total Consultas:</span>
              <p className="font-medium text-gray-900">{consultas.length}</p>
            </div>
          </div>

          {/* Datos Detallados de la Historia Clínica */}
          {historiaClinica.datosJson && (
            <div className="space-y-6">
              {(() => {
                try {
                  const parsed = JSON.parse(historiaClinica.datosJson);
                  const datosHistoria = parsed.datosJson ? JSON.parse(parsed.datosJson) : {};

                  return (
                    <div className="space-y-6">
                      {/* Información del Médico e Información de Consulta en una fila */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Información del Médico */}
                        {(datosHistoria.informacionMedico || datosHistoria.detalleConsulta) && (
                          <div className="bg-white p-4 rounded-lg border">
                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                              <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                              Médico Responsable
                            </h6>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Nombre:</span>
                                <span className="font-medium">{(datosHistoria.informacionMedico?.medicoResponsable || datosHistoria.detalleConsulta?.medicoTratante) || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Registro:</span>
                                <span className="font-medium">{(datosHistoria.informacionMedico?.registroMedico) || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Especialidad:</span>
                                <span className="font-medium">{(datosHistoria.informacionMedico?.especialidad || datosHistoria.detalleConsulta?.especialidad) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Información de la Consulta */}
                        {datosHistoria.informacionConsulta && (
                          <div className="bg-white p-4 rounded-lg border">
                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                              <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                              Consulta Inicial
                            </h6>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">Motivo:</span>
                                <p className="mt-1">{datosHistoria.informacionConsulta.motivoConsulta || 'Apertura de historia clínica'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                <p className="mt-1">{datosHistoria.informacionConsulta.enfermedadActual || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Antecedentes Clínicos */}
                      {datosHistoria.antecedentesClinico && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                            <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                            Antecedentes Clínicos
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Personales:</span>
                              <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesPersonales || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Familiares:</span>
                              <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesFamiliares || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Quirúrgicos:</span>
                              <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesQuirurgicos || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Alérgicos:</span>
                              <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesAlergicos || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Examen Clínico */}
                        {datosHistoria.examenClinico && (
                          <div className="bg-white p-4 rounded-lg border">
                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                              <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                              Examen Clínico
                            </h6>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">Examen Físico:</span>
                                <p className="mt-1">{datosHistoria.examenClinico.examenFisico || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                <p className="mt-1">{datosHistoria.examenClinico.signosVitales || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Diagnóstico y Tratamiento */}
                        {datosHistoria.diagnosticoTratamiento && (
                          <div className="bg-white p-4 rounded-lg border">
                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                              <DocumentTextIcon className="h-4 w-4 mr-2 text-orange-600" />
                              Diagnóstico y Tratamiento
                            </h6>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                <p className="mt-1">{datosHistoria.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                <p className="mt-1">{datosHistoria.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Información adicional de consulta si existe */}
                      {datosHistoria.informacionConsulta && (datosHistoria.informacionConsulta.revisionSistemas || datosHistoria.informacionConsulta.medicamentosActuales || datosHistoria.informacionConsulta.observaciones) && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h6 className="font-semibold text-gray-900 mb-3">Información Adicional de la Consulta</h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {datosHistoria.informacionConsulta.revisionSistemas && (
                              <div>
                                <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                <p className="mt-1">{datosHistoria.informacionConsulta.revisionSistemas}</p>
                              </div>
                            )}
                            {datosHistoria.informacionConsulta.medicamentosActuales && (
                              <div>
                                <span className="text-gray-600 font-medium">Medicamentos:</span>
                                <p className="mt-1">{datosHistoria.informacionConsulta.medicamentosActuales}</p>
                              </div>
                            )}
                            {datosHistoria.informacionConsulta.observaciones && (
                              <div className="md:col-span-3">
                                <span className="text-gray-600 font-medium">Observaciones:</span>
                                <p className="mt-1 bg-gray-50 p-2 rounded">{datosHistoria.informacionConsulta.observaciones}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return (
                    <div className="bg-gray-100 p-4 rounded border">
                      <h6 className="font-medium text-gray-800 mb-2">Datos Adicionales (JSON Crudo):</h6>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                        {historiaClinica.datosJson}
                      </pre>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Detalle Completo de Consultas Médicas */}
        <div>
          <h5 className="font-semibold text-gray-900 mb-4 text-lg">Consultas Médicas Detalladas ({consultas.length})</h5>

          {consultas.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultas.map((consulta, index) => (
                <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  {/* Header de la consulta */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h6 className="text-xl font-semibold text-gray-900">Consulta #{consulta.id}</h6>
                        <p className="text-sm text-gray-600 flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {formatDate(consulta.fechaCreacion)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => printConsulta(consulta, historiaClinica, patient, patientData)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Imprimir esta consulta"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                      </button>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Historia Clínica</p>
                        <p className="text-sm font-semibold text-blue-600">{historiaClinica.numeroHistoria}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información Detallada de la Consulta */}
                  {consulta.datosJson && (
                    <div className="space-y-6">
                      {(() => {
                        try {
                          const parsed = JSON.parse(consulta.datosJson);

                          return (
                            <div className="space-y-6">
                              {/* Primera fila: Detalle de consulta e Información médica */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Detalle de la Consulta */}
                                {parsed.detalleConsulta && (
                                  <div className="bg-gray-50 p-4 rounded-lg border">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-600" />
                                      Detalle de la Consulta
                                    </h6>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Médico Tratante:</span>
                                        <span className="font-medium">{parsed.detalleConsulta.medicoTratante || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Especialidad:</span>
                                        <span className="font-medium">{parsed.detalleConsulta.especialidad || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Fecha Consulta:</span>
                                        <span className="font-medium">{parsed.detalleConsulta.fechaConsulta ? formatDate(parsed.detalleConsulta.fechaConsulta) : 'N/A'}</span>
                                      </div>
                                      {parsed.detalleConsulta.proximaCita && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Próxima Cita:</span>
                                          <span className="font-medium">{parsed.detalleConsulta.proximaCita}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Información médica adicional */}
                                {parsed.informacionMedico && (
                                  <div className="bg-gray-50 p-4 rounded-lg border">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <UserIcon className="h-4 w-4 mr-2 text-green-600" />
                                      Información Médica
                                    </h6>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Registro Médico:</span>
                                        <span className="font-medium">{parsed.informacionMedico.registroMedico || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Especialidad:</span>
                                        <span className="font-medium">{parsed.informacionMedico.especialidad || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Información de la Consulta */}
                              {parsed.informacionConsulta && (
                                <div className="bg-white p-4 rounded-lg border">
                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                                    Información de la Consulta
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600 font-medium">Motivo de Consulta:</span>
                                      <p className="mt-1 font-medium">{parsed.informacionConsulta.motivoConsulta || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                      <p className="mt-1 font-medium">{parsed.informacionConsulta.enfermedadActual || 'N/A'}</p>
                                    </div>
                                    {parsed.informacionConsulta.revisionSistemas && (
                                      <div>
                                        <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                        <p className="mt-1">{parsed.informacionConsulta.revisionSistemas}</p>
                                      </div>
                                    )}
                                    {parsed.informacionConsulta.medicamentosActuales && (
                                      <div>
                                        <span className="text-gray-600 font-medium">Medicamentos Actuales:</span>
                                        <p className="mt-1">{parsed.informacionConsulta.medicamentosActuales}</p>
                                      </div>
                                    )}
                                    {parsed.informacionConsulta.observaciones && (
                                      <div className="md:col-span-2">
                                        <span className="text-gray-600 font-medium">Observaciones:</span>
                                        <p className="mt-1 bg-gray-50 p-2 rounded">{parsed.informacionConsulta.observaciones}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Examen Clínico */}
                                {parsed.examenClinico && (
                                  <div className="bg-white p-4 rounded-lg border">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                                      Examen Clínico
                                    </h6>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-gray-600 font-medium">Examen Físico:</span>
                                        <p className="mt-1">{parsed.examenClinico.examenFisico || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                        <p className="mt-1">{parsed.examenClinico.signosVitales || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Diagnóstico y Tratamiento */}
                                {parsed.diagnosticoTratamiento && (
                                  <div className="bg-white p-4 rounded-lg border">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                                      Diagnóstico y Tratamiento
                                    </h6>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                        <p className="mt-1">{parsed.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                        <p className="mt-1">{parsed.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Seguimiento de la Consulta */}
                              {parsed.seguimientoConsulta && (
                                <div className="bg-white p-4 rounded-lg border">
                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-2 text-orange-600" />
                                    Seguimiento de la Consulta
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600 font-medium">Evolución:</span>
                                      <p className="mt-1">{parsed.seguimientoConsulta.evolucion || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 font-medium">Complicaciones:</span>
                                      <p className="mt-1">{parsed.seguimientoConsulta.complicaciones || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 font-medium">Recomendaciones:</span>
                                      <p className="mt-1">{parsed.seguimientoConsulta.recomendaciones || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="bg-gray-100 p-4 rounded border">
                              <h6 className="font-medium text-gray-800 mb-2">Información Detallada (JSON Crudo):</h6>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                                {consulta.datosJson}
                              </pre>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientClinicalHistoryCompleteTab;