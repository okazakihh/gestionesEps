import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { UserIcon } from '@heroicons/react/24/outline';
import { pacientesApiService, historiasClinicasApiService } from '../../../../../data/services/pacientesApiService.js';
import CreateHistoriaClinicaModal from '../medicalRecords/CreateHistoriaClinicaModal.jsx';
import CreateConsultaMedicaModal from '../medicalRecords/CreateConsultaMedicaModal.jsx';
import PatientDetailModal from '../patientDetail/PatientDetailModal.jsx';
import Swal from 'sweetalert2';
import { Modal, ActionIcon, Group, Button, Loader, Alert, Stack, Paper, Table, Text } from '@mantine/core';
import { useAuth } from '../../../../../data/context/AuthContext.jsx';
import { hasPermission, PERMISSIONS } from '../../../../../negocio/utils/auth/permissions.js';

// Import extracted components
import AgendaFilters from './AgendaFilters.jsx';
import AgendaStatusBadge from './AgendaStatusBadge.jsx';
import AgendaEmptyState from './AgendaEmptyState.jsx';
import AgendaCitaDetailModal from './AgendaCitaDetailModal.jsx';

// Import business logic
import {
  parseCitaInfo,
  parsePacienteInfo,
  filterCitas,
  getPendingCitas,
  getAvailableStatusTransitions,
  getStatusLabel,
  getStatusIcon,
  formatDate
} from '../../../../../negocio/services/agendaService.jsx';

const AgendaModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [loadingPatients, setLoadingPatients] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });
  // Initialize filters with no date filter to show all appointments
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    paciente: ''
  });

  // Function to handle date selection from calendar
  const handleDateSelection = (selectedDate) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setFilters(prev => ({
      ...prev,
      fechaInicio: dateString,
      fechaFin: dateString
    }));
  };
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [showCitasCards, setShowCitasCards] = useState(true);
  const [selectedCitaForDetail, setSelectedCitaForDetail] = useState(null);
  const [isCitaDetailModalOpen, setIsCitaDetailModalOpen] = useState(false);

  // Estado para manejar diferentes vistas del modal
  const [currentView, setCurrentView] = useState('agenda'); // 'agenda', 'create_historia', 'create_consulta', 'view_patient'
  const [currentCita, setCurrentCita] = useState(null); // Cita que se está atendiendo
  const [currentPacienteId, setCurrentPacienteId] = useState(null); // ID del paciente que se está viendo
  const [historiaClinicaId, setHistoriaClinicaId] = useState(null); // ID de historia clínica si existe

  useEffect(() => {
    if (isOpen) {
      loadCitasPendientes();
    } else {
      // Reset state when modal closes
      setPatientData({});
      setLoadingPatients({});
      setCurrentView('agenda');
      setCurrentCita(null);
      setCurrentPacienteId(null);
      setHistoriaClinicaId(null);
    }
  }, [isOpen, searchParams]);

  // Load patient data when citas are loaded
  useEffect(() => {
    if (citas.length > 0) {
      citas.forEach(cita => {
        if (cita.pacienteId && !patientData[cita.pacienteId] && !loadingPatients[cita.pacienteId]) {
          loadPatientData(cita.pacienteId);
        }
      });
    }
  }, [citas]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [citas, filters]);

  // Reload citas when date range changes
  useEffect(() => {
    if (isOpen) {
      loadCitasPendientes();
    }
  }, [filters.fechaInicio, filters.fechaFin, isOpen]);

  const loadCitasPendientes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all appointments instead of just pending ones to show all statuses
      const response = await pacientesApiService.getCitas(searchParams);
      setCitas(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('No se pudo conectar con el servicio de citas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar citas');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (pacienteId) => {
    if (patientData[pacienteId] || loadingPatients[pacienteId]) {
      return; // Already loaded or loading
    }

    try {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: true }));
      const response = await pacientesApiService.getPacienteById(pacienteId);
      setPatientData(prev => ({ ...prev, [pacienteId]: response }));
    } catch (err) {
      console.error('Error loading patient data:', err);
      // Set empty data to avoid retrying
      setPatientData(prev => ({ ...prev, [pacienteId]: {} }));
    } finally {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: false }));
    }
  };


  // Get all citas for the agenda view (not just pending ones)
  const allCitas = useMemo(() => {
    return citas; // Show all citas in agenda modal
  }, [citas]);

  // Get citas for the selected date
  const citasForSelectedDate = useMemo(() => {
    if (!filters.fechaInicio) return [];
    const selectedDate = new Date(filters.fechaInicio);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return citas.filter(cita => {
      const citaInfo = parseCitaInfo(cita);
      if (!citaInfo.fechaHoraCita) return false;
      const citaDate = new Date(citaInfo.fechaHoraCita);
      return citaDate >= selectedDate && citaDate < nextDay;
    });
  }, [citas, filters.fechaInicio]);


  const updateAppointmentStatus = async (citaId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: true }));

      console.log('🎯 Attempting to update cita', citaId, 'to status:', newStatus);

      // Debug: Log current cita data
      const currentCita = citas.find(c => c.id === citaId);
      console.log('Current cita data:', currentCita);
      console.log('Current cita datosJson:', currentCita?.datosJson);

      console.log('🔄 About to call pacientesApiService.actualizarEstadoCita...');
      const response = await pacientesApiService.actualizarEstadoCita(citaId, newStatus);
      console.log('✅ API response received:', response);

      // The response should be the data object directly (not wrapped in success/data structure)
      // Update the cita in the local state
      setCitas(prevCitas =>
        prevCitas.map(cita =>
          cita.id === citaId ? response : cita
        )
      );

      // Show success message with SweetAlert2
      const statusLabels = {
        'EN_SALA': 'En Sala',
        'ATENDIDO': 'Atendido',
        'NO_SE_PRESENTO': 'No se Presentó',
        'CANCELADO': 'Cancelado'
      };

      await Swal.fire({
        icon: 'success',
        title: '¡Estado Actualizado!',
        text: `La cita ha sido cambiada a "${statusLabels[newStatus] || newStatus}" exitosamente.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      console.log(`Estado de cita ${citaId} actualizado a ${newStatus}`);

      // Si se canceló la cita, recargar la lista para actualizar las horas disponibles
      if (newStatus === 'CANCELADO') {
        loadCitasPendientes();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);

      // Show error message with SweetAlert2
      const errorMessage = error.message || 'Error desconocido';

      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar Estado',
        text: `No se pudo actualizar el estado de la cita. ${errorMessage}`,
        confirmButtonColor: '#EF4444',
        footer: 'Por favor, verifica que la transición de estado sea válida.'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: false }));
    }
  };

  const applyFilters = () => {
    const filtered = filterCitas(citas, filters, user, patientData, loadingPatients);
    setFilteredCitas(filtered);
  };

  const clearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      paciente: ''
    });
  };

  // Función para verificar si el paciente tiene historia clínica
  const checkPatientHasHistoriaClinica = async (pacienteId) => {
    try {
      const historia = await historiasClinicasApiService.getHistoriaClinicaByPaciente(pacienteId);
      return historia ? historia.id : null;
    } catch (error) {
      console.log('Paciente no tiene historia clínica:', pacienteId);
      return null;
    }
  };

  // Función para manejar el clic en "Atendido"
  const handleAtendidoClick = async (cita) => {
    setCurrentCita(cita);

    // Cerrar el modal de detalle de cita si está abierto
    setIsCitaDetailModalOpen(false);
    setSelectedCitaForDetail(null);

    // Verificar si el paciente tiene historia clínica
    const historiaId = await checkPatientHasHistoriaClinica(cita.pacienteId);
    setHistoriaClinicaId(historiaId);

    if (historiaId) {
      // Tiene historia clínica, mostrar formulario de consulta
      setCurrentView('create_consulta');
    } else {
      // No tiene historia clínica, mostrar formulario de historia clínica
      setCurrentView('create_historia');
    }
  };

  // Función para manejar el éxito de crear historia clínica
  const handleHistoriaClinicaCreated = async (historiaClinica) => {
    console.log('Historia clínica creada:', historiaClinica);

    // Ahora que se creó la historia clínica, cambiar a vista de crear consulta
    setHistoriaClinicaId(historiaClinica.id);
    setCurrentView('create_consulta');
  };

  // Función para manejar el éxito de crear consulta médica
  const handleConsultaMedicaCreated = async (consulta) => {
    console.log('Consulta médica creada:', consulta);

    // Ahora cambiar el estado de la cita a ATENDIDO
    if (currentCita) {
      await updateAppointmentStatus(currentCita.id, 'ATENDIDO');
    }

    // Volver a la vista de agenda
    setCurrentView('agenda');
    setCurrentCita(null);
    setHistoriaClinicaId(null);
  };

  // Función para manejar el clic en "Ver Paciente"
  const handleViewPatient = (pacienteId) => {
    setCurrentPacienteId(pacienteId);
    setCurrentView('view_patient');
  };

  // Función para manejar el clic en "Detalle de la Cita"
  const handleViewCitaDetail = (cita) => {
    setSelectedCitaForDetail(cita);
    setIsCitaDetailModalOpen(true);
  };

  // Función para cerrar el modal de detalle de cita
  const handleCloseCitaDetailModal = () => {
    setIsCitaDetailModalOpen(false);
    setSelectedCitaForDetail(null);
  };

  // Función para volver a la agenda desde los formularios
  const handleBackToAgenda = () => {
    setCurrentView('agenda');
    setCurrentCita(null);
    setCurrentPacienteId(null);
    setHistoriaClinicaId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        opened={isOpen && currentView === 'agenda'}
        onClose={onClose}
        title={
          <Group>
            {currentView !== 'agenda' && (
              <ActionIcon
                variant="subtle"
                onClick={handleBackToAgenda}
                title="Volver a la agenda"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </ActionIcon>
            )}
            <Text fw={600} size="lg">
              {currentView === 'agenda' && 'Agenda de Citas'}
              {currentView === 'create_historia' && 'Nueva Historia Clínica'}
              {currentView === 'create_consulta' && 'Nueva Consulta Médica'}
              {currentView === 'view_patient' && 'Información del Paciente'}
            </Text>
          </Group>
        }
        size="90%"
        styles={{
          body: { height: '70vh', overflowY: 'auto' },
          title: { width: '100%' }
        }}
      >
        {currentView === 'agenda' && (
          <Stack gap="md">
            {error && (
              <Alert color="red" title="Error" withCloseButton onClose={() => setError(null)}>
                <Text size="sm" mb="md">{error}</Text>
                <Button color="red" size="xs" onClick={loadCitasPendientes}>
                  Reintentar
                </Button>
              </Alert>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Loader size="lg" color="green" />
              </div>
            ) : (
              <Stack gap="lg">
                {/* Filters */}
                <AgendaFilters
                  filters={filters}
                  setFilters={setFilters}
                  clearFilters={clearFilters}
                />

                {/* Toggle Citas Cards */}
                <Group justify="space-between" mb="md">
                  <Text size="lg" fw={500}>Citas Médicas</Text>
                  <Button
                    variant="default"
                    onClick={() => setShowCitasCards(!showCitasCards)}
                  >
                    {showCitasCards ? 'Ocultar Citas' : 'Mostrar Citas'}
                  </Button>
                </Group>

                {/* Citas Table */}
                {showCitasCards && (
                  <>
                    {filteredCitas.length === 0 ? (
                      <AgendaEmptyState
                        hasCitas={citas.length > 0}
                        hasFilters={filters.fechaInicio !== getTodayDate() || filters.fechaFin !== getTodayDate() || filters.estado || filters.paciente}
                        userRole={user?.rol}
                      />
                    ) : (
                      <Paper withBorder>
                        <Table.ScrollContainer minWidth={800}>
                          <Table striped highlightOnHover>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>ID Cita</Table.Th>
                                <Table.Th>Paciente</Table.Th>
                                <Table.Th>Fecha/Hora</Table.Th>
                                <Table.Th>Especialidad</Table.Th>
                                <Table.Th>Estado</Table.Th>
                                <Table.Th>Acciones</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {filteredCitas.map((cita) => {
                                const citaInfo = parseCitaInfo(cita);
                                const pacienteInfo = parsePacienteInfo(cita, patientData, loadingPatients);

                                return (
                                  <Table.Tr key={cita.id}>
                                    <Table.Td>
                                      <Text size="sm" fw={500}>#{cita.id}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <div>
                                        <Text size="sm" fw={500}>{pacienteInfo.nombre}</Text>
                                        <Text size="xs" c="dimmed">{pacienteInfo.documento}</Text>
                                      </div>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm" c="dimmed">
                                        {citaInfo.fechaHoraCita ? formatDate(citaInfo.fechaHoraCita) : 'N/A'}
                                      </Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm" c="dimmed">{citaInfo.especialidad}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <AgendaStatusBadge status={citaInfo.estado} />
                                    </Table.Td>
                                    <Table.Td>
                                      <Group gap="xs">
                                        <ActionIcon
                                          variant="light"
                                          color="gray"
                                          size="sm"
                                          onClick={() => handleViewPatient(cita.pacienteId)}
                                          title="Ver paciente"
                                        >
                                          <UserIcon className="w-4 h-4" />
                                        </ActionIcon>
                                        <ActionIcon
                                          variant="light"
                                          color="blue"
                                          size="sm"
                                          onClick={() => handleViewCitaDetail(cita)}
                                          title="Detalle de la cita"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </ActionIcon>
                                        {/* Status Change Buttons - Only show if status allows transitions */}
                                        {getAvailableStatusTransitions(citaInfo.estado, user, { pacientes: { mark_attended: hasPermission(user?.rol, PERMISSIONS.PACIENTES, 'mark_attended') } }).length > 0 && (
                                          <>
                                            {getAvailableStatusTransitions(citaInfo.estado, user, { pacientes: { mark_attended: hasPermission(user?.rol, PERMISSIONS.PACIENTES, 'mark_attended') } }).map((newStatus) => (
                                              <ActionIcon
                                                key={newStatus}
                                                variant="light"
                                                color={
                                                  newStatus === 'EN_SALA' ? 'yellow' :
                                                  newStatus === 'ATENDIDO' ? 'green' :
                                                  newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                                  newStatus === 'CANCELADO' ? 'gray' : 'blue'
                                                }
                                                size="sm"
                                                onClick={async () => {
                                                  // Confirmación para todos los cambios de estado
                                                  const statusLabels = {
                                                    'EN_SALA': 'En Sala',
                                                    'ATENDIDO': 'Atendido',
                                                    'NO_SE_PRESENTO': 'No se Presentó',
                                                    'CANCELADO': 'Cancelado'
                                                  };

                                                  const confirmMessages = {
                                                    'EN_SALA': {
                                                      title: '¿Cambiar estado a "En Sala"?',
                                                      text: 'El paciente está siendo atendido en la sala de espera.',
                                                      icon: 'question',
                                                      confirmButtonColor: '#F59E0B'
                                                    },
                                                    'ATENDIDO': {
                                                      title: '¿Marcar cita como atendida?',
                                                      text: 'Esta acción creará automáticamente la historia clínica y consulta médica si no existen. ¿Desea continuar?',
                                                      icon: 'question',
                                                      confirmButtonColor: '#10B981'
                                                    },
                                                    'NO_SE_PRESENTO': {
                                                      title: '¿Marcar como "No se Presentó"?',
                                                      text: 'El paciente no asistió a la cita programada.',
                                                      icon: 'warning',
                                                      confirmButtonColor: '#EF4444'
                                                    },
                                                    'CANCELADO': {
                                                      title: '¿Cancelar Cita?',
                                                      text: 'Esta acción liberará el espacio en el calendario y la cita ya no podrá ser modificada. ¿Estás seguro?',
                                                      icon: 'warning',
                                                      confirmButtonColor: '#EF4444'
                                                    }
                                                  };

                                                  const confirmConfig = confirmMessages[newStatus];
                                                  if (confirmConfig) {
                                                    const result = await Swal.fire({
                                                      ...confirmConfig,
                                                      showCancelButton: true,
                                                      cancelButtonColor: '#6B7280',
                                                      confirmButtonText: newStatus === 'ATENDIDO' ? 'Sí, marcar como atendida' :
                                                                        newStatus === 'CANCELADO' ? 'Sí, cancelar cita' :
                                                                        newStatus === 'NO_SE_PRESENTO' ? 'Sí, confirmar' :
                                                                        'Sí, cambiar estado',
                                                      cancelButtonText: 'Cancelar'
                                                    });

                                                    if (result.isConfirmed) {
                                                      if (newStatus === 'ATENDIDO') {
                                                        handleAtendidoClick(cita);
                                                      } else {
                                                        updateAppointmentStatus(cita.id, newStatus);
                                                      }
                                                    }
                                                  }
                                                }}
                                                disabled={updatingStatus[cita.id]}
                                                title={getStatusLabel(newStatus)}
                                              >
                                                {updatingStatus[cita.id] ? (
                                                  <Loader size="xs" color="white" />
                                                ) : (
                                                  getStatusIcon(newStatus)
                                                )}
                                              </ActionIcon>
                                            ))}
                                          </>
                                        )}
                                      </Group>
                                    </Table.Td>
                                  </Table.Tr>
                                );
                              })}
                            </Table.Tbody>
                          </Table>
                        </Table.ScrollContainer>
                      </Paper>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Modal>

      {/* Modals */}
      {currentView === 'create_historia' && currentCita && (
        <CreateHistoriaClinicaModal
          isOpen={true}
          onClose={handleBackToAgenda}
          onHistoriaCreated={handleHistoriaClinicaCreated}
          pacienteId={currentCita.pacienteId}
          citaId={currentCita.id}
          citaData={{
            ...parseCitaInfo(currentCita),
            ...parsePacienteInfo(currentCita, patientData, loadingPatients)
          }}
        />
      )}

      {currentView === 'create_consulta' && currentCita && (
        <CreateConsultaMedicaModal
          isOpen={true}
          onClose={handleBackToAgenda}
          onConsultaCreated={handleConsultaMedicaCreated}
          historiaClinicaId={historiaClinicaId}
          patientData={patientData[currentCita.pacienteId]}
          citaData={{
            ...parseCitaInfo(currentCita),
            ...parsePacienteInfo(currentCita, patientData, loadingPatients)
          }}
        />
      )}

      {currentView === 'view_patient' && currentPacienteId && (
        <PatientDetailModal
          patientId={currentPacienteId}
          isOpen={true}
          onClose={handleBackToAgenda}
        />
      )}

      {/* Modal de Detalle de Cita */}
      {isCitaDetailModalOpen && selectedCitaForDetail && (
        <AgendaCitaDetailModal
          cita={selectedCitaForDetail}
          citaInfo={parseCitaInfo(selectedCitaForDetail)}
          pacienteInfo={parsePacienteInfo(selectedCitaForDetail, patientData, loadingPatients)}
          onClose={handleCloseCitaDetailModal}
          formatDate={formatDate}
          availableStatusTransitions={getAvailableStatusTransitions(parseCitaInfo(selectedCitaForDetail).estado, user, { pacientes: { mark_attended: hasPermission(user?.rol, PERMISSIONS.PACIENTES, 'mark_attended') } })}
          onStatusChange={async (citaId, newStatus) => {
            if (newStatus === 'ATENDIDO') {
              handleAtendidoClick(selectedCitaForDetail);
            } else if (newStatus === 'CANCELADO') {
              const result = await Swal.fire({
                title: '¿Cancelar Cita?',
                text: 'Esta acción liberará el espacio en el calendario y la cita ya no podrá ser modificada. ¿Estás seguro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Sí, cancelar cita',
                cancelButtonText: 'No, mantener cita'
              });

              if (result.isConfirmed) {
                updateAppointmentStatus(citaId, newStatus);
                handleCloseCitaDetailModal();
              }
            } else {
              updateAppointmentStatus(citaId, newStatus);
              handleCloseCitaDetailModal();
            }
          }}
          updatingStatus={updatingStatus}
        />
      )}
    </>
  );
};

AgendaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AgendaModal;