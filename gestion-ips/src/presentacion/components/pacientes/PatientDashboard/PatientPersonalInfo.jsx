import React from 'react';
import { formatDate, calculateAge } from '../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para mostrar la información personal del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientPersonalInfo = ({ patientData, patient }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos Personales</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Primer Nombre:</span>
            <span className="font-medium">{patientData.informacionPersonal?.primerNombre || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Segundo Nombre:</span>
            <span className="font-medium">{patientData.informacionPersonal?.segundoNombre || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Primer Apellido:</span>
            <span className="font-medium">{patientData.informacionPersonal?.primerApellido || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Segundo Apellido:</span>
            <span className="font-medium">{patientData.informacionPersonal?.segundoApellido || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha de Nacimiento:</span>
            <span className="font-medium">{formatDate(patientData.informacionPersonal?.fechaNacimiento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Edad:</span>
            <span className="font-medium">{calculateAge(patientData.informacionPersonal?.fechaNacimiento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Género:</span>
            <span className="font-medium">{patientData.informacionPersonal?.genero || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado Civil:</span>
            <span className="font-medium">{patientData.informacionPersonal?.estadoCivil || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de Sangre:</span>
            <span className="font-medium">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nacionalidad:</span>
            <span className="font-medium">{patientData.informacionPersonal?.nacionalidad || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estrato Socioeconómico:</span>
            <span className="font-medium">{patientData.informacionPersonal?.estratoSocioeconomico || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grupo Étnico:</span>
            <span className="font-medium">{patientData.informacionPersonal?.grupoEtnico || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discapacidad:</span>
            <span className="font-medium">{patientData.informacionPersonal?.discapacidad || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ocupación:</span>
            <span className="font-medium">{patientData.informacionPersonal?.ocupacion || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nivel Educativo:</span>
            <span className="font-medium">{patientData.informacionPersonal?.nivelEducativo || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Sistema</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">ID del Paciente:</span>
            <span className="font-medium">{patient?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo Documento:</span>
            <span className="font-medium">{patient?.tipoDocumento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Número Documento:</span>
            <span className="font-medium">{patient?.numeroDocumento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-medium ${patient?.activo ? 'text-green-600' : 'text-red-600'}`}>
              {patient?.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha Registro:</span>
            <span className="font-medium">{formatDate(patient?.fechaCreacion)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Última Actualización:</span>
            <span className="font-medium">{formatDate(patient?.fechaActualizacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPersonalInfo;