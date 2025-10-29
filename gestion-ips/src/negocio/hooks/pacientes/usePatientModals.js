import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

/**
 * Custom Hook para manejar la lógica de modales de pacientes
 * @returns {Object} Estados y funciones para manejar modales
 */
export const usePatientModals = () => {
  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false);
  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);

  // Estados para datos seleccionados
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState(null);
  const [selectedSlotForAppointment, setSelectedSlotForAppointment] = useState(null);
  const [prefillDocumentNumber, setPrefillDocumentNumber] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [historiaClinicaId, setHistoriaClinicaId] = useState(null);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handlers para modal de detalle de paciente
  const handlePatientClick = useCallback((patientId) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  }, []);

  // Handlers para modal de crear/editar paciente
  const handleOpenCreatePatientModal = useCallback(() => {
    setIsCreatePatientModalOpen(true);
  }, []);

  const handleCloseCreatePatientModal = useCallback(() => {
    setIsCreatePatientModalOpen(false);
    setPrefillDocumentNumber('');
    setEditingPatient(null);
  }, []);

  const handleCreatePatient = useCallback((documentNumber) => {
    setPrefillDocumentNumber(documentNumber);
    setIsPatientSearchModalOpen(false);
    setIsCreatePatientModalOpen(true);
  }, []);

  const handleEditPatient = useCallback((patient) => {
    setEditingPatient(patient);
    setIsCreatePatientModalOpen(true);
    setIsModalOpen(false);
  }, []);

  // Handlers para modal de búsqueda de pacientes
  const handleClosePatientSearchModal = useCallback(() => {
    setIsPatientSearchModalOpen(false);
    setSelectedSlotForAppointment(null);
  }, []);

  // Handlers para modal de agenda
  const handleOpenAgendaModal = useCallback(() => {
    setIsAgendaModalOpen(true);
  }, []);

  const handleCloseAgendaModal = useCallback(() => {
    setIsAgendaModalOpen(false);
  }, []);

  // Handlers para modal de agendar cita
  const handleScheduleAppointment = useCallback((patientId, patientName) => {
    setSelectedPatientForAppointment({ id: patientId, name: patientName });
    setIsAppointmentModalOpen(true);
  }, []);

  const handleCloseAppointmentModal = useCallback(() => {
    setIsAppointmentModalOpen(false);
    setSelectedPatientForAppointment(null);
  }, []);

  const handleSlotClick = useCallback((slot, doctorId = null) => {
    if (!slot.available) return;

    setSelectedSlotForAppointment({
      ...slot,
      doctorId: doctorId
    });
    setIsPatientSearchModalOpen(true);
  }, []);

  const handlePatientSelected = useCallback((patient, patientName) => {
    setSelectedPatientForAppointment({
      id: patient.id,
      name: patientName,
      slot: selectedSlotForAppointment
    });
    setIsPatientSearchModalOpen(false);
    setIsAppointmentModalOpen(true);
  }, [selectedSlotForAppointment]);

  // Handlers para modales de historia clínica y consulta
  const handleCloseHistoriaModal = useCallback(() => {
    setIsHistoriaModalOpen(false);
    setCurrentAppointment(null);
  }, []);

  const handleCloseConsultaModal = useCallback(() => {
    setIsConsultaModalOpen(false);
    setCurrentAppointment(null);
    setHistoriaClinicaId(null);
  }, []);

  const handleHistoriaClinicaCreated = useCallback(async (historiaClinica) => {
    handleCloseHistoriaModal();
    
    await Swal.fire({
      title: '¡Historia Clínica Creada!',
      text: 'La historia clínica ha sido registrada correctamente',
      icon: 'success',
      confirmButtonColor: '#10B981'
    });
  }, [handleCloseHistoriaModal]);

  const handleConsultaMedicaCreated = useCallback(async (consulta) => {
    handleCloseConsultaModal();
    
    await Swal.fire({
      title: '¡Consulta Registrada!',
      text: 'La consulta médica ha sido registrada correctamente',
      icon: 'success',
      confirmButtonColor: '#10B981'
    });
  }, [handleCloseConsultaModal]);

  return {
    // Estados de modales
    isModalOpen,
    isCreatePatientModalOpen,
    isPatientSearchModalOpen,
    isAgendaModalOpen,
    isAppointmentModalOpen,
    isHistoriaModalOpen,
    isConsultaModalOpen,

    // Estados de datos seleccionados
    selectedPatientId,
    selectedPatientForAppointment,
    selectedSlotForAppointment,
    prefillDocumentNumber,
    editingPatient,
    currentAppointment,
    historiaClinicaId,

    // Estados para búsqueda y filtros
    searchTerm,
    filterStatus,
    showFilters,
    refreshTrigger,

    // Setters (para casos especiales)
    setSelectedPatientForAppointment,
    setSelectedSlotForAppointment,
    setCurrentAppointment,
    setHistoriaClinicaId,
    setIsHistoriaModalOpen,
    setIsConsultaModalOpen,
    setEditingPatient,
    setSearchTerm,
    setFilterStatus,
    setShowFilters,
    setRefreshTrigger,

    // Handlers
    handlePatientClick,
    handleCloseModal,
    handleOpenCreatePatientModal,
    handleCloseCreatePatientModal,
    handleCreatePatient,
    handleEditPatient,
    handleClosePatientSearchModal,
    handleOpenAgendaModal,
    handleCloseAgendaModal,
    handleScheduleAppointment,
    handleCloseAppointmentModal,
    handleSlotClick,
    handlePatientSelected,
    handleCloseHistoriaModal,
    handleCloseConsultaModal,
    handleHistoriaClinicaCreated,
    handleConsultaMedicaCreated
  };
};
