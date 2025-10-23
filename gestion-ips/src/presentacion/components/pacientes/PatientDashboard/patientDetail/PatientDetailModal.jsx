import React, { useState, useEffect } from 'react';
import { pacientesApiService, historiasClinicasApiService, consultasApiService } from '../../../../../data/services/pacientesApiService.js';

// Importar componentes de modal reutilizables
import BaseModal from '../../../ui/BaseModal.jsx';
import ModalContent from '../../../ui/ModalContent.jsx';
import ModalFooter from '../../../ui/ModalFooter.jsx';

// Importar utilidades
import { parsePatientData } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';
import { printHistoriaClinica, printConsulta } from '../../../../../negocio/utils/pacientes/printUtils.js';

// Importar componentes extraídos
import PatientModalHeader from './PatientModalHeader.jsx';
import PatientModalTabs from './PatientModalTabs.jsx';
import PatientModalContent from './PatientModalContent.jsx';

const PatientDetailModal = ({ patientId, isOpen, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientDetails();
    }
  }, [isOpen, patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);

      // Load patient basic info
      const patientResponse = await pacientesApiService.getPacienteById(patientId);
      setPatient(patientResponse);

      // Load clinical history
      try {
        const historiaResponse = await historiasClinicasApiService.getHistoriaClinicaByPaciente(patientId);
        setHistoriaClinica(historiaResponse);

        // Load consultations if history exists
        if (historiaResponse?.id) {
          const consultasResponse = await consultasApiService.getConsultasByHistoria(historiaResponse.id, { page: 0, size: 10 });
          setConsultas(consultasResponse.content || []);
        }
      } catch (error) {
        console.log('No clinical history found for patient:', patientId);
        setHistoriaClinica(null);
        setConsultas([]);
      }

    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const patientData = patient ? parsePatientData(patient) : {};

  // Determinar si mostrar las pestañas normales o la vista completa
  const showTabs = !['clinica_completa'].includes(activeTab);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="80vw">
      <PatientModalHeader patient={patient} patientData={patientData} onClose={onClose} />

      <ModalContent>
        <div className="flex-1 overflow-y-auto max-h-[75vh]">
          {/* Tabs */}
          {showTabs && (
            <PatientModalTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          <PatientModalContent
            activeTab={activeTab}
            patient={patient}
            patientData={patientData}
            historiaClinica={historiaClinica}
            consultas={consultas}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cerrar
        </button>
      </ModalFooter>
    </BaseModal>
  );
};

export default PatientDetailModal;