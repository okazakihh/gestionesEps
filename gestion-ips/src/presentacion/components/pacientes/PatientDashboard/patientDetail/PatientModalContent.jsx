import React from 'react';
import { Stack, Loader } from '@mantine/core';

// Importar utilidades
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

// Importar componentes extraídos para clean code
import PatientGeneralInfo from './PatientGeneralInfo.jsx';
import PatientClinicalHistory from './PatientClinicalHistory.jsx';
import PatientClinicalHistoryCompleteNew from './PatientClinicalHistoryCompleteNew.jsx';

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
      <Stack align="center" justify="center" h={256}>
        <Loader color="blue" size="xl" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Información General (Personal + Contacto + Emergencia) */}
      {activeTab === 'personal' && (
        <PatientGeneralInfo
          patientData={patientData}
          patient={patient}
        />
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
        <PatientClinicalHistoryCompleteNew
          historiaClinica={historiaClinica}
          consultas={consultas}
          setActiveTab={setActiveTab}
          patient={patient}
          patientData={patientData}
        />
      )}
    </Stack>
  );
};

export default PatientModalContent;