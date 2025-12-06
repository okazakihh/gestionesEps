import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import { useAuth } from '../../../data/context/AuthContext.jsx';

// Importar custom hooks
import { useAppointmentManagement } from '../../../negocio/hooks/citas/useAppointmentManagement.js';
import { usePatientManagement } from '../../../negocio/hooks/pacientes/usePatientManagement.js';
import { useCalendarManagement } from '../../../negocio/hooks/calendario/useCalendarManagement.js';
import { DisponibilidadProvider, useDisponibilidadContext } from './DisponibilidadContext.jsx';

// Importar componentes
import DashboardLayout from '../../components/pacientes/PatientDashboard/createPatient/DashboardLayout.jsx';
import CalendarSidebar from '../../components/pacientes/PatientDashboard/createPatient/CalendarSidebar.jsx';
import MainDashboardContent from '../../components/pacientes/PatientDashboard/appointments/MainDashboardContent.jsx';
import PatientFilters from './PatientFilters.jsx';
import PatientList from '../../components/pacientes/PatientDashboard/patients/PatientList.jsx';
import PatientDetailModal from '../../components/pacientes/PatientDashboard/patientDetail/PatientDetailModal.jsx';
import CreatePatientModal from '../../components/pacientes/PatientDashboard/createPatient/CreatePatientModal.jsx';
import PatientSearchModal from '../../components/pacientes/PatientDashboard/patientDetail/PatientSearchModal.jsx';
import ScheduleAppointmentModal from '../../components/pacientes/PatientDashboard/agendaModal/ScheduleAppointmentModal.jsx';
import CreateHistoriaClinicaModal from '../../components/pacientes/PatientDashboard/medicalRecords/CreateHistoriaClinicaModal.jsx';
import CreateConsultaMedicaModal from '../../components/pacientes/PatientDashboard/medicalRecords/CreateConsultaMedicaModal.jsx';
import AppointmentDetailModal from '../../components/pacientes/PatientDashboard/appointments/AppointmentDetailModal.jsx';

const PatientDashboardContent = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const { disponibilidades, loadingDisponibilidades } = useDisponibilidadContext();

   // Usar custom hooks para manejar estado
   const appointmentManagement = useAppointmentManagement(user);
   const patientManagement = usePatientManagement();
   const calendarManagement = useCalendarManagement();

   // Estados locales restantes (mínimos)
   const [refreshTrigger, setRefreshTrigger] = useState(0);

   // Estados para filtros (mover a hook después)
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('all');
   const [showFilters, setShowFilters] = useState(false);

  // Manejo de la fecha seleccionada en el nivel más alto
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDaySelect = (date) => {
    setSelectedDate(date);
    // Cargar los datos de la agenda para la fecha seleccionada
    appointmentManagement.loadAllDoctorsData(date, disponibilidades);
  };

  // Modal handlers usando los hooks
  const handlePatientClick = patientManagement.handlePatientClick;
  const handleCloseModal = patientManagement.handleCloseModal;

  const handleScheduleAppointment = (patientId, patientName) => {
    const patientData = patientManagement.handleScheduleAppointment(patientId, patientName);
    appointmentManagement.setSelectedPatientForAppointment(patientData);
    appointmentManagement.setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    appointmentManagement.setIsAppointmentModalOpen(false);
    appointmentManagement.setSelectedPatientForAppointment(null);
  };

  const handleSlotClick = (slot, doctorId = null) => {
    const slotData = calendarManagement.handleSlotClick(slot, doctorId, selectedDate);
    appointmentManagement.setSelectedSlotForAppointment(slotData);
    patientManagement.setIsPatientSearchModalOpen(true);
  };

  const handlePatientSelected = (patient, patientName) => {
    const patientData = patientManagement.handlePatientSelected(patient, patientName);
    appointmentManagement.setSelectedPatientForAppointment({
      ...patientData,
      slot: appointmentManagement.selectedSlotForAppointment
    });
    appointmentManagement.setIsAppointmentModalOpen(true);
  };

  const handleCreatePatient = patientManagement.handleCreatePatient;

  const handleEditPatient = patientManagement.handleEditPatient;

  const handleClosePatientSearchModal = () => {
    patientManagement.handleClosePatientSearchModal();
    appointmentManagement.setSelectedSlotForAppointment(null);
  };

  const handleAppointmentCreated = async () => {
    await appointmentManagement.handleAppointmentCreated();
    if (selectedDate) {
      await appointmentManagement.loadAllDoctorsData(selectedDate, disponibilidades);
    }
  };

  const handleOpenCreatePatientModal = patientManagement.handleOpenCreatePatientModal;
  const handleCloseCreatePatientModal = patientManagement.handleCloseCreatePatientModal;

  const handlePatientCreated = async (patientData) => {
    const result = await patientManagement.handlePatientCreated(patientData, appointmentManagement.selectedSlotForAppointment);

    if (result.shouldCreateAppointment) {
      appointmentManagement.setSelectedPatientForAppointment(result.patientData);
      appointmentManagement.setIsAppointmentModalOpen(true);
    } else {
      appointmentManagement.setSelectedSlotForAppointment(null);
    }
  };

  const getNombreCompletoMedico = appointmentManagement.getNombreCompletoMedico;

  return (
    <MainLayout title="Dashboard de Pacientes" subtitle="Gestión integral del flujo médico de pacientes">
      <div className="px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Content Layout */}
        <DashboardLayout
          sidebar={
            <CalendarSidebar
              onDaySelect={handleDaySelect}
              disponibilidades={disponibilidades}
              onNewPatient={handleOpenCreatePatientModal}
            />
          }
          mainContent={
            <div className="space-y-6">
              <MainDashboardContent
                selectedDate={selectedDate}
                onSlotClick={handleSlotClick}
                onPatientClick={handlePatientClick}
                onViewAppointmentDetail={appointmentManagement.handleViewAppointmentDetail}
                allDoctorAppointments={appointmentManagement.allDoctorAppointments}
                loadingAppointments={appointmentManagement.loadingAppointments}
                user={user}
                calculateAvailableSlots={calendarManagement.calculateAvailableSlots}
                getDoctorInitials={calendarManagement.getDoctorInitials}
                updatingStatus={appointmentManagement.updatingStatus}
                getAppointmentInfo={appointmentManagement.getAppointmentInfo}
              />
              <PatientFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
              <PatientList
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onPatientClick={handlePatientClick}
                onScheduleAppointment={handleScheduleAppointment}
                onEditPatient={handleEditPatient}
                onNewPatient={handleOpenCreatePatientModal}
                refreshTrigger={refreshTrigger}
              />
            </div>
          }
        />

        {/* MODALES */}
        {/* Estos modales se mantienen aquí porque son "globales" o conectan diferentes sub-sistemas */}
        
            {/* Patient List */}
        <PatientDetailModal
          patientId={patientManagement.selectedPatientId}
          isOpen={patientManagement.isModalOpen}
          onClose={handleCloseModal}
        />

        <CreatePatientModal
          isOpen={patientManagement.isCreatePatientModalOpen}
          onClose={handleCloseCreatePatientModal}
          onPatientCreated={handlePatientCreated}
          prefillDocumentNumber={patientManagement.prefillDocumentNumber}
          editingPatient={patientManagement.editingPatient}
        />

        <PatientSearchModal
          isOpen={patientManagement.isPatientSearchModalOpen}
          onClose={handleClosePatientSearchModal}
          onPatientSelected={handlePatientSelected}
          onCreatePatient={handleCreatePatient}
          selectedSlot={appointmentManagement.selectedSlotForAppointment}
      selectedDoctor={appointmentManagement.selectedSlotForAppointment?.doctorId ? appointmentManagement.medicos.find(m => m.id == appointmentManagement.selectedSlotForAppointment.doctorId) : null}
        />

        {/* Schedule Appointment Modal (render only when opening to avoid prop-type warnings) */}
        {appointmentManagement.isAppointmentModalOpen && appointmentManagement.selectedPatientForAppointment && (
          <ScheduleAppointmentModal
            patientId={appointmentManagement.selectedPatientForAppointment.id}
            patientName={appointmentManagement.selectedPatientForAppointment.name}
            selectedSlot={appointmentManagement.selectedPatientForAppointment.slot}
        selectedDoctor={appointmentManagement.selectedPatientForAppointment.slot?.doctorId ? appointmentManagement.medicos.find(m => m.id == appointmentManagement.selectedPatientForAppointment.slot.doctorId) : null}
            isOpen={appointmentManagement.isAppointmentModalOpen}
            onClose={handleCloseAppointmentModal}
            onAppointmentCreated={handleAppointmentCreated}
          />
        )}

      </div>

      {/* Modal de Historia Clínica */}
      {appointmentManagement.isHistoriaModalOpen && appointmentManagement.currentAppointment && (
        <CreateHistoriaClinicaModal
          isOpen={true}
          onClose={appointmentManagement.handleCloseHistoriaModal}
          onHistoriaCreated={appointmentManagement.handleHistoriaClinicaCreated}
          pacienteId={appointmentManagement.currentAppointment.pacienteId}
          citaId={appointmentManagement.currentAppointment.id}
          citaData={appointmentManagement.getAppointmentInfo(appointmentManagement.currentAppointment)}
          patientData={appointmentManagement.currentAppointment.patientData}
        />
      )}

      {/* Modal de Consulta Médica */}
      {appointmentManagement.isConsultaModalOpen && appointmentManagement.currentAppointment && (
        <CreateConsultaMedicaModal
          isOpen={true}
          onClose={appointmentManagement.handleCloseConsultaModal}
          onConsultaCreated={appointmentManagement.handleConsultaMedicaCreated}
          historiaClinicaId={appointmentManagement.historiaClinicaId}
          patientData={appointmentManagement.currentAppointment.patientData}
          citaData={appointmentManagement.getAppointmentInfo(appointmentManagement.currentAppointment)}
        />
      )}

      {/* Modal de Detalle de Cita */}
      {appointmentManagement.isAppointmentDetailModalOpen && appointmentManagement.selectedAppointmentForDetail && (() => {
        return (
          <AppointmentDetailModal
            isOpen={appointmentManagement.isAppointmentDetailModalOpen}
            onClose={appointmentManagement.handleCloseAppointmentDetailModal}
            selectedAppointment={appointmentManagement.selectedAppointmentForDetail}
            appointmentDetailPatientInfo={appointmentManagement.appointmentDetailPatientInfo}
            loadingAppointmentDetailPatient={appointmentManagement.loadingAppointmentDetailPatient}
            getAppointmentInfo={appointmentManagement.getAppointmentInfo}
            getAvailableStatusTransitions={appointmentManagement.getAvailableStatusTransitions}
            updateAppointmentStatus={appointmentManagement.updateAppointmentStatus}
            onAtendidoClick={appointmentManagement.handleAtendidoClick}
            user={user}
          />
        );
      })()}
    </MainLayout>
  );
};

const PatientDashboard = () => {
  return (
    <DisponibilidadProvider>
      <PatientDashboardContent />
    </DisponibilidadProvider>
  );
};

export default PatientDashboard;