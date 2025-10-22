import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import ModalHeader from '../../ui/ModalHeader.jsx';
import { calculateAge } from '../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para el header del modal de detalles del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.patient - Datos del paciente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @returns {JSX.Element} Header del modal
 */
const PatientModalHeader = ({ patient, patientData, onClose }) => {
  const patientName = `${patientData.informacionPersonal?.primerNombre || ''} ${patientData.informacionPersonal?.segundoNombre || ''} ${patientData.informacionPersonal?.primerApellido || ''} ${patientData.informacionPersonal?.segundoApellido || ''}`.trim() || 'Detalle del Paciente';

  const patientSubtitle = `${patient?.tipoDocumento || ''} ${patient?.numeroDocumento || ''} • ${calculateAge(patientData.informacionPersonal?.fechaNacimiento)}`;

  return (
    <ModalHeader
      title={patientName}
      subtitle={patientSubtitle}
      onClose={onClose}
      icon={UserIcon}
    />
  );
};

export default PatientModalHeader;