import React from 'react';
import { DocumentTextIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la historia clínica resumida del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientClinicalHistory = ({ historiaClinica, consultas, setActiveTab, formatDate }) => {
  return (
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
  );
};

export default PatientClinicalHistory;