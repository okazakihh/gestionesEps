import React from 'react';
import { BuildingOfficeIcon, HeartIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la información médica del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientMedicalInfo = ({ patientData }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Médica</h4>
      <div className="space-y-6">
        {/* Información básica médica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: 'none' }}>
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">EPS</p>
              <p className="font-medium">{patientData.informacionMedica?.eps || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <HeartIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Régimen de Afiliación</p>
              <p className="font-medium">{patientData.informacionMedica?.regimenAfiliacion || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <HeartIcon className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm text-gray-600">Tipo de Sangre</p>
              <p className="font-medium">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Antecedentes médicos */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h5 className="font-semibold text-gray-900 mb-3">Antecedentes Médicos</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Antecedentes Personales</p>
              <p className="font-medium bg-white p-3 rounded border min-h-[80px]">
                {patientData.informacionMedica?.antecedentesPersonales || 'No registrados'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Antecedentes Familiares</p>
              <p className="font-medium bg-white p-3 rounded border min-h-[80px]">
                {patientData.informacionMedica?.antecedentesFamiliares || 'No registrados'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Enfermedades Crónicas</p>
              <p className="font-medium bg-white p-3 rounded border min-h-[60px]">
                {patientData.informacionMedica?.enfermedadesCronicas || 'Ninguna registrada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Vacunas e Inmunizaciones</p>
              <p className="font-medium bg-white p-3 rounded border min-h-[60px]">
                {patientData.informacionMedica?.vacunas || 'No registradas'}
              </p>
            </div>
          </div>
        </div>

        {/* Información actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Alergias</p>
            <p className="font-medium bg-yellow-50 p-3 rounded-md border">
              {patientData.informacionMedica?.alergias || 'Ninguna registrada'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medicamentos Actuales</p>
            <p className="font-medium bg-blue-50 p-3 rounded-md border">
              {patientData.informacionMedica?.medicamentosActuales || 'Ninguno registrado'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Observaciones Médicas Adicionales</p>
          <p className="font-medium bg-gray-50 p-4 rounded-md border min-h-[100px]">
            {patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalInfo;