import React from 'react';
import {
  IdentificationIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para la pestaña de contacto de emergencia del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @returns {JSX.Element} Contenido de la pestaña de emergencia
 */
const PatientEmergencyContactTab = ({ patientData }) => {
  return (
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
  );
};

export default PatientEmergencyContactTab;