import React from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la información de contacto del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientContactInfo = ({ patientData }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de Contacto</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Teléfono Principal</p>
              <p className="font-medium">{patientData.informacionContacto?.telefono || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-600">Teléfono Móvil</p>
              <p className="font-medium">{patientData.informacionPersonal?.telefonoMovil || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{patientData.informacionContacto?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-medium">{patientData.informacionContacto?.direccion || 'N/A'}</p>
              <p className="text-sm text-gray-600 mt-1">
                {patientData.informacionContacto?.ciudad}, {patientData.informacionContacto?.departamento}
              </p>
              <p className="text-sm text-gray-600">
                {patientData.informacionContacto?.pais}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientContactInfo;