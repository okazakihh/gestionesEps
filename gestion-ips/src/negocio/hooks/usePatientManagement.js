// hooks/usePatientManagement.js
import { useState } from 'react';
import Swal from 'sweetalert2';

export const usePatientManagement = () => {
  // Estados para pacientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [prefillDocumentNumber, setPrefillDocumentNumber] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estados para agenda
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);

  // Handlers para pacientes
  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  const handleScheduleAppointment = (patientId, patientName) => {
    return { id: patientId, name: patientName };
  };

  const handleCreatePatient = (documentNumber) => {
    // Close search modal and open create patient modal with document pre-filled
    setIsPatientSearchModalOpen(false);
    setPrefillDocumentNumber(documentNumber);
    setIsCreatePatientModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    // Set editing mode and open create patient modal with patient data
    setEditingPatient(patient);
    setIsCreatePatientModalOpen(true);
  };

  const handlePatientSelected = (patient, patientName) => {
    return {
      id: patient.id,
      name: patientName,
      patient: patient
    };
  };

  const handleClosePatientSearchModal = () => {
    setIsPatientSearchModalOpen(false);
  };

  const handleOpenCreatePatientModal = () => {
    setIsCreatePatientModalOpen(true);
  };

  const handleCloseCreatePatientModal = () => {
    setIsCreatePatientModalOpen(false);
    setPrefillDocumentNumber('');
    setEditingPatient(null);
  };

  const handlePatientCreated = async (patientData, selectedSlotForAppointment) => {
    // Refresh patient list
    setRefreshTrigger(prev => prev + 1);
    console.log('Paciente procesado exitosamente - lista actualizada', patientData);

    // Only show appointment creation confirmation for new patients (not when editing)
    if (!editingPatient && selectedSlotForAppointment) {
      const result = await Swal.fire({
        title: '¿Crear cita médica?',
        text: `El paciente ${patientData.nombreCompleto || 'ha sido creado exitosamente'}. ¿Desea agendar una cita médica para este paciente en el horario seleccionado?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, crear cita',
        cancelButtonText: 'No, gracias'
      });

      if (result.isConfirmed) {
        // Create patient name from patient data
        let patientName = 'Paciente';
        try {
          if (patientData.datosJson) {
            const parsedData = JSON.parse(patientData.datosJson);
            if (parsedData.datosJson) {
              const innerData = JSON.parse(parsedData.datosJson);
              const personalInfo = innerData.informacionPersonal || {};
              patientName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim() || `Paciente ${patientData.id}`;
            }
          }
        } catch (error) {
          console.error('Error parsing patient name:', error);
          patientName = `Paciente ${patientData.id}`;
        }

        return {
          shouldCreateAppointment: true,
          patientData: {
            id: patientData.id,
            name: patientName,
            slot: selectedSlotForAppointment
          }
        };
      } else {
        // Clear the selected slot since they don't want to create appointment
        return { shouldCreateAppointment: false };
      }
    }

    // Clear editing state after processing
    setEditingPatient(null);
    return { shouldCreateAppointment: false };
  };

  const handleOpenAgendaModal = () => {
    setIsAgendaModalOpen(true);
  };

  const handleCloseAgendaModal = () => {
    setIsAgendaModalOpen(false);
  };

  return {
    // Estados
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    showFilters,
    setShowFilters,
    selectedPatientId,
    isModalOpen,
    isCreatePatientModalOpen,
    prefillDocumentNumber,
    editingPatient,
    isPatientSearchModalOpen,
    setIsPatientSearchModalOpen,
    refreshTrigger,
    isAgendaModalOpen,

    // Handlers
    handlePatientClick,
    handleCloseModal,
    handleScheduleAppointment,
    handleCreatePatient,
    handleEditPatient,
    handlePatientSelected,
    handleClosePatientSearchModal,
    handleOpenCreatePatientModal,
    handleCloseCreatePatientModal,
    handlePatientCreated,
    handleOpenAgendaModal,
    handleCloseAgendaModal
  };
};