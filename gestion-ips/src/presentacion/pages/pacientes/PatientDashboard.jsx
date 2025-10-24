import React, { useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import {

  MagnifyingGlassIcon,
  FunnelIcon,

  UserIcon,
  ClockIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ActionIcon, Group } from '@mantine/core';
import Swal from 'sweetalert2';
import { useAuth } from '../../../data/context/AuthContext.jsx';
import { hasPermission, PERMISSIONS } from '../../../negocio/utils/auth/permissions.js';
import { ESTADO_PACIENTE_OPTIONS, EPS_OPTIONS, TIPO_SANGRE_OPTIONS } from '../../../negocio/utils/listHelps.js';

// Importar custom hooks
import { useAppointmentManagement } from '../../../negocio/hooks/useAppointmentManagement.js';
import { usePatientManagement } from '../../../negocio/hooks/usePatientManagement.js';
import { useCalendarManagement } from '../../../negocio/hooks/useCalendarManagement.js';

// Importar servicios de negocio
import { appointmentService } from '../../../negocio/services/appointmentService.js';

// Importar componentes
import PatientList from '../../components/pacientes/PatientDashboard/PatientList.jsx';
import PatientDetailModal from '../../components/pacientes/PatientDashboard/patientDetail/PatientDetailModal.jsx';
import CreatePatientModal from '../../components/pacientes/PatientDashboard/createPatient/CreatePatientModal.jsx';
import PatientSearchModal from '../../components/pacientes/PatientDashboard/patientDetail/PatientSearchModal.jsx';
import AgendaModal from '../../components/pacientes/PatientDashboard/agendaModal/AgendaModal.jsx';
import ScheduleAppointmentModal from '../../components/pacientes/PatientDashboard/ScheduleAppointmentModal.jsx';
import CalendarWidget from '../../components/pacientes/PatientDashboard/CalendarWidget.jsx';
import CreateHistoriaClinicaModal from '../../components/pacientes/PatientDashboard/CreateHistoriaClinicaModal.jsx';
import CreateConsultaMedicaModal from '../../components/pacientes/PatientDashboard/CreateConsultaMedicaModal.jsx';

const PatientDashboard = () => {
   const navigate = useNavigate();
   const { user } = useAuth();

   // Usar custom hooks para manejar estado
   const appointmentManagement = useAppointmentManagement();
   const patientManagement = usePatientManagement();
   const calendarManagement = useCalendarManagement();

   // Estados locales restantes (mínimos)
   const [refreshTrigger, setRefreshTrigger] = useState(0);

   // Estados para filtros (mover a hook después)
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('all');
   const [showFilters, setShowFilters] = useState(false);

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
    if (!slot.available) return;

    const slotData = calendarManagement.handleSlotClick(slot, doctorId);
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
    // Forzar recarga de datos del calendario después de crear cita
    await calendarManagement.handleDaySelect(calendarManagement.selectedDate);
  };

  // Funciones delegadas a los hooks
  const getAvailableStatusTransitions = appointmentService.getAvailableStatusTransitions;
  const getStatusLabel = appointmentService.getStatusLabel;
  const updateAppointmentStatus = appointmentManagement.updateAppointmentStatus;

  const handleViewAppointmentDetail = appointmentManagement.handleViewAppointmentDetail;

  const handleAtendidoClick = appointmentManagement.handleAtendidoClick;

  // Funciones delegadas a servicios
  const formatDate = appointmentService.formatDate;

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

  const handleOpenAgendaModal = patientManagement.handleOpenAgendaModal;

  const handleCloseAgendaModal = patientManagement.handleCloseAgendaModal;

  // Función delegada al hook de calendario
  const calculateAvailableSlots = calendarManagement.calculateAvailableSlots;

  // Funciones delegadas a los hooks
  const getDoctorInitials = calendarManagement.getDoctorInitials;
  const getNombreCompletoMedico = appointmentManagement.getNombreCompletoMedico;


  return (
    <MainLayout title="Dashboard de Pacientes" subtitle="Gestión integral del flujo médico de pacientes">
      <div className="px-4 sm:px-6 lg:px-8">

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Calendar */}
            <CalendarWidget
              onDaySelect={calendarManagement.handleDaySelect}
              onNewPatient={handleOpenCreatePatientModal}
              onOpenAgenda={handleOpenAgendaModal}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appointment Availability Card */}
            {calendarManagement.selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Agenda Médica - {calendarManagement.selectedDate.toLocaleDateString('es-ES')}
                  {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO') && (
                    <span className="ml-2 text-sm font-normal text-blue-600">(Vista Personal)</span>
                  )}
                </h3>

                {/* Multi-Doctor Schedule Display */}
                <div className="space-y-6">
                  {/* Time slots for all doctors */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
                        ? 'Mis Horarios Disponibles'
                        : 'Horarios Disponibles por Doctor'
                      }
                    </h4>

                    {calendarManagement.loadingAppointments ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-xs text-gray-500">Cargando horarios...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto overflow-y-auto max-h-96">
                        <div className="grid grid-cols-5 gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                          {Object.entries(calendarManagement.allDoctorAppointments).map(([doctorId, doctorData]) => {
                            const { doctor, doctorName, appointments: doctorAppointments } = doctorData;
                            const availableSlots = calendarManagement.calculateAvailableSlots(doctorAppointments, calendarManagement.selectedDate);

                            return (
                              <div key={doctorId} className="border border-gray-200 rounded-lg p-3 min-w-72 flex-shrink-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-800">
                                      {calendarManagement.getDoctorInitials(doctorName)}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-900">{doctorName}</h5>
                                    <p className="text-xs text-gray-500">{doctorAppointments.length} citas</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-6 gap-1">
                                  {availableSlots.map((slot) => (
                                    <div
                                      key={`${doctorId}-${slot.time}`}
                                      onClick={() => slot.available && handleSlotClick(slot, doctorId)}
                                      className={`p-0.5 text-center text-[10px] rounded border transition-colors ${
                                        slot.available
                                          ? 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-sm'
                                          : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                                      }`}
                                      title={slot.available ? `Click para agendar cita con ${doctorName}` : 'Horario ocupado'}
                                    >
                                      {slot.label}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Appointments for all doctors */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
                        ? `Mis Citas Programadas - ${calendarManagement.selectedDate.toLocaleDateString('es-ES')}`
                        : `Todas las Citas Programadas - ${calendarManagement.selectedDate.toLocaleDateString('es-ES')}`
                      }
                    </h4>

                    {calendarManagement.loadingAppointments ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando citas...</p>
                      </div>
                    ) : Object.values(calendarManagement.allDoctorAppointments).some(doctorData =>
                        doctorData.appointments.some(appointment => {
                          try {
                            const appointmentData = JSON.parse(appointment.datosJson || '{}');
                            return appointmentData.estado !== 'ATENDIDO';
                          } catch (error) {
                            return true;
                          }
                        })
                      ) ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {Object.entries(calendarManagement.allDoctorAppointments).map(([doctorId, doctorData]) =>
                          doctorData.appointments
                            .filter(appointment => {
                              try {
                                const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                return appointmentData.estado !== 'ATENDIDO';
                              } catch (error) {
                                return true;
                              }
                            })
                            .map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-800">
                                    {calendarManagement.getDoctorInitials(doctorData.doctorName)}
                                  </span>
                                </div>
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <div>
                                  <span className="text-sm font-medium">{(() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      const appointmentDateTime = new Date(appointmentData.fechaHoraCita);
                                      return appointmentDateTime.toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      });
                                    } catch (error) {
                                      return 'N/A';
                                    }
                                  })()} - {appointment.patient || 'Paciente'}</span>
                                  <p className="text-xs text-gray-600">
                                    {(() => {
                                      try {
                                        const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                        const informacionCups = appointmentData.informacionCups;
                                        if (informacionCups && informacionCups.tipo) {
                                          return `Tipo: ${informacionCups.tipo}`;
                                        }
                                        return appointmentData.motivo || 'REVISION PERIODICA';
                                      } catch (error) {
                                        return 'REVISION PERIODICA';
                                      }
                                    })()}
                                    {(() => {
                                      try {
                                        const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                        const duracion = appointmentData.duracion || 30;
                                        return ` (${duracion} min)`;
                                      } catch (error) {
                                        return ' (30 min)';
                                      }
                                    })()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  (() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      const status = appointmentData.estado || 'PROGRAMADO';
                                      return status === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                                             status === 'EN_SALA' ? 'bg-yellow-100 text-yellow-800' :
                                             status === 'ATENDIDO' ? 'bg-green-100 text-green-800' :
                                             status === 'CANCELADA' ? 'bg-gray-100 text-gray-800' :
                                             'bg-red-100 text-red-800';
                                    } catch (error) {
                                      return 'bg-blue-100 text-blue-800';
                                    }
                                  })()
                                }`}>
                                  {(() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      const status = appointmentData.estado || 'PROGRAMADO';
                                      return status === 'PROGRAMADO' ? 'Programado' :
                                             status === 'EN_SALA' ? 'En Sala' :
                                             status === 'ATENDIDO' ? 'Atendido' :
                                             status === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                             status === 'CANCELADA' ? 'Cancelada' :
                                             status;
                                    } catch (error) {
                                      return 'Programado';
                                    }
                                  })()}
                                </span>
                                <Group gap="xs">
                                  <ActionIcon
                                    variant="light"
                                    color="gray"
                                    size="sm"
                                    onClick={() => handlePatientClick(appointment.pacienteId)}
                                    title="Ver paciente"
                                  >
                                    <UserIcon className="w-4 h-4" />
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    onClick={() => handleViewAppointmentDetail(appointment)}
                                    title="Detalle de la cita"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </ActionIcon>
                                  {/* Status Change Buttons */}
                                  {appointmentService.getAvailableStatusTransitions((() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      return appointmentData.estado || 'PROGRAMADO';
                                    } catch (error) {
                                      return 'PROGRAMADO';
                                    }
                                  })()).filter(newStatus => {
                                    // Hide ATENDIDO button if user doesn't have permission
                                    if (newStatus === 'ATENDIDO') {
                                      return hasPermission(user?.rol, PERMISSIONS.PACIENTES, 'mark_attended');
                                    }
                                    return true;
                                  }).map((newStatus) => (
                                    <ActionIcon
                                      key={newStatus}
                                      variant="light"
                                      color={
                                        newStatus === 'EN_SALA' ? 'yellow' :
                                        newStatus === 'ATENDIDO' ? 'green' :
                                        newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                        newStatus === 'CANCELADA' ? 'gray' : 'blue'
                                      }
                                      size="sm"
                                      onClick={async () => {
                                        // Confirmación para todos los cambios de estado
                                        const statusLabels = {
                                          'EN_SALA': 'En Sala',
                                          'ATENDIDO': 'Atendido',
                                          'NO_SE_PRESENTO': 'No se Presentó',
                                          'CANCELADA': 'Cancelada'
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
                                          'CANCELADA': {
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
                                                              newStatus === 'CANCELADA' ? 'Sí, cancelar cita' :
                                                              newStatus === 'NO_SE_PRESENTO' ? 'Sí, confirmar' :
                                                              'Sí, cambiar estado',
                                            cancelButtonText: 'Cancelar'
                                          });

                                          if (result.isConfirmed) {
                                            if (newStatus === 'ATENDIDO') {
                                              await handleAtendidoClick(appointment);
                                            } else {
                                              await appointmentManagement.updateAppointmentStatus(appointment.id, newStatus);
                                            }
                                            // Forzar recarga de datos del calendario después de cambiar estado
                                            await calendarManagement.handleDaySelect(calendarManagement.selectedDate);
                                          }
                                        }
                                      }}
                                      disabled={appointmentManagement.updatingStatus[appointment.id]}
                                      title={appointmentService.getStatusLabel(newStatus)}
                                      loading={appointmentManagement.updatingStatus[appointment.id]}
                                    >
                                      {newStatus === 'EN_SALA' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {newStatus === 'ATENDIDO' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {newStatus === 'NO_SE_PRESENTO' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                      {newStatus === 'CANCELADA' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                    </ActionIcon>
                                  ))}
                                </Group>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay citas programadas para este día
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!calendarManagement.selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Selecciona un día</h3>
                  <p className="text-xs text-gray-500">Haz click en un día del calendario para ver la disponibilidad de citas</p>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar pacientes por nombre, documento o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ESTADO_PACIENTE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">EPS</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        {EPS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Todos</option>
                        {TIPO_SANGRE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient List */}
            <div className="bg-white shadow rounded-lg">
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
          </div>
        </div>

        {/* Patient Detail Modal */}
        <PatientDetailModal
          patientId={patientManagement.selectedPatientId}
          isOpen={patientManagement.isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Create Patient Modal */}
        <CreatePatientModal
          isOpen={patientManagement.isCreatePatientModalOpen}
          onClose={handleCloseCreatePatientModal}
          onPatientCreated={handlePatientCreated}
          prefillDocumentNumber={patientManagement.prefillDocumentNumber}
          editingPatient={patientManagement.editingPatient}
        />

        {/* Patient Search Modal */}
        <PatientSearchModal
          isOpen={patientManagement.isPatientSearchModalOpen}
          onClose={handleClosePatientSearchModal}
          onPatientSelected={handlePatientSelected}
          onCreatePatient={handleCreatePatient}
          selectedSlot={appointmentManagement.selectedSlotForAppointment}
          selectedDoctor={appointmentManagement.selectedSlotForAppointment?.doctorId ? getNombreCompletoMedico(calendarManagement.medicos.find(m => m.id == appointmentManagement.selectedSlotForAppointment.doctorId)) : null}
        />

        {/* Agenda Modal */}
        <AgendaModal
          isOpen={patientManagement.isAgendaModalOpen}
          onClose={handleCloseAgendaModal}
        />

        {/* Schedule Appointment Modal */}
        <ScheduleAppointmentModal
          patientId={appointmentManagement.selectedPatientForAppointment?.id}
          patientName={appointmentManagement.selectedPatientForAppointment?.name}
          selectedSlot={appointmentManagement.selectedPatientForAppointment?.slot}
          selectedDoctor={appointmentManagement.selectedPatientForAppointment?.slot?.doctorId ? getNombreCompletoMedico(calendarManagement.medicos.find(m => m.id == appointmentManagement.selectedPatientForAppointment.slot.doctorId)) : null}
          isOpen={appointmentManagement.isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onAppointmentCreated={handleAppointmentCreated}
        />

      </div>

      {/* Modal de Historia Clínica */}
      {appointmentManagement.isHistoriaModalOpen && appointmentManagement.currentAppointment && (
        <CreateHistoriaClinicaModal
          isOpen={true}
          onClose={appointmentManagement.handleCloseHistoriaModal}
          onHistoriaCreated={appointmentManagement.handleHistoriaClinicaCreated}
          pacienteId={appointmentManagement.currentAppointment.pacienteId}
          citaId={appointmentManagement.currentAppointment.id}
          citaData={{
            ...appointmentService.getAppointmentInfo(appointmentManagement.currentAppointment),
            ...appointmentService.getAppointmentPatientInfo(appointmentManagement.currentAppointment)
          }}
        />
      )}

      {/* Modal de Consulta Médica */}
      {appointmentManagement.isConsultaModalOpen && appointmentManagement.currentAppointment && (
        <CreateConsultaMedicaModal
          isOpen={true}
          onClose={appointmentManagement.handleCloseConsultaModal}
          onConsultaCreated={appointmentManagement.handleConsultaMedicaCreated}
          historiaClinicaId={appointmentManagement.historiaClinicaId}
          citaData={{
            ...appointmentService.getAppointmentInfo(appointmentManagement.currentAppointment),
            ...appointmentService.getAppointmentPatientInfo(appointmentManagement.currentAppointment)
          }}
        />
      )}

      {/* Modal de Detalle de Cita */}
      {appointmentManagement.isAppointmentDetailModalOpen && appointmentManagement.selectedAppointmentForDetail && (() => {
        const appointmentInfo = appointmentService.getAppointmentInfo(appointmentManagement.selectedAppointmentForDetail);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={appointmentManagement.handleCloseAppointmentDetailModal}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Detalle de la Cita #{appointmentManagement.selectedAppointmentForDetail.id}
                  </h3>
                  <button
                    onClick={appointmentManagement.handleCloseAppointmentDetailModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Estado y Fecha */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          appointmentInfo.estado === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                          appointmentInfo.estado === 'EN_SALA' ? 'bg-yellow-100 text-yellow-800' :
                          appointmentInfo.estado === 'ATENDIDO' ? 'bg-green-100 text-green-800' :
                          appointmentInfo.estado === 'CANCELADA' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointmentInfo.estado === 'PROGRAMADO' ? 'Programado' :
                           appointmentInfo.estado === 'EN_SALA' ? 'En Sala' :
                           appointmentInfo.estado === 'ATENDIDO' ? 'Atendido' :
                           appointmentInfo.estado === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                           appointmentInfo.estado === 'CANCELADA' ? 'Cancelada' :
                           appointmentInfo.estado}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{appointmentInfo.fechaHoraCita ? formatDate(appointmentInfo.fechaHoraCita) : 'Fecha no disponible'}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creada: {formatDate(appointmentManagement.selectedAppointmentForDetail.fechaCreacion)}
                      </div>
                    </div>

                    {/* Información del Paciente */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                        Información del Paciente
                      </h4>
                      {appointmentManagement.loadingAppointmentDetailPatient ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Cargando información del paciente...</span>
                        </div>
                      ) : appointmentManagement.appointmentDetailPatientInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Nombre Completo</p>
                            <p className="text-sm text-gray-600">{appointmentManagement.appointmentDetailPatientInfo.nombre}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Documento</p>
                            <p className="text-sm text-gray-600">{appointmentManagement.appointmentDetailPatientInfo.documento}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Teléfono</p>
                            <p className="text-sm text-gray-600">{appointmentManagement.appointmentDetailPatientInfo.telefono}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Estado</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              appointmentManagement.appointmentDetailPatientInfo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {appointmentManagement.appointmentDetailPatientInfo.estado}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No se pudo cargar la información del paciente</p>
                      )}
                    </div>

                    {/* Información de la Cita */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Información de la Cita
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Especialidad</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.especialidad}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Médico Asignado</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.medicoAsignado}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Tipo de Cita</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.tipoCita}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Motivo</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.motivo}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Duración</p>
                          <p className="text-sm text-blue-700">{appointmentInfo.duracion} minutos</p>
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      {appointmentInfo.notas && appointmentInfo.notas !== 'Sin notas' && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">Notas Adicionales</p>
                          <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">{appointmentInfo.notas}</p>
                        </div>
                      )}
                    </div>

                    {/* Información CUPS */}
                    {appointmentInfo.codigoCups && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Código CUPS
                        </h4>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-green-900">Código:</span>
                          <span className="ml-2 text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">{appointmentInfo.codigoCups}</span>
                        </div>
                        {appointmentInfo.informacionCups && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {appointmentInfo.informacionCups.categoria && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Categoría:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.categoria}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.tipo && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Tipo:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.tipo}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.ambito && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Ámbito:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.ambito}</span>
                              </div>
                            )}
                            {appointmentInfo.informacionCups.equipo_requerido && (
                              <div>
                                <span className="text-xs font-medium text-green-800">Equipo Requerido:</span>
                                <span className="ml-1 text-xs text-green-700">{appointmentInfo.informacionCups.equipo_requerido}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Acciones disponibles */}
                    {appointmentInfo.estado !== 'CANCELADA' && appointmentInfo.estado !== 'NO_SE_PRESENTO' && appointmentInfo.estado !== 'ATENDIDO' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Acciones Disponibles</h4>
                        <div className="flex flex-wrap gap-2">
                          {appointmentService.getAvailableStatusTransitions(appointmentInfo.estado)
                            .filter(newStatus => newStatus !== 'ATENDIDO') // Excluir el botón ATENDIDO
                            .map((newStatus) => (
                            <button
                              key={newStatus}
                              onClick={async () => {
                                // Confirmación para todos los cambios de estado
                                const statusLabels = {
                                  'EN_SALA': 'En Sala',
                                  'ATENDIDO': 'Atendido',
                                  'NO_SE_PRESENTO': 'No se Presentó',
                                  'CANCELADA': 'Cancelada'
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
                                  'CANCELADA': {
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
                                                      newStatus === 'CANCELADA' ? 'Sí, cancelar cita' :
                                                      newStatus === 'NO_SE_PRESENTO' ? 'Sí, confirmar' :
                                                      'Sí, cambiar estado',
                                    cancelButtonText: 'Cancelar'
                                  });

                                  if (result.isConfirmed) {
                                    if (newStatus === 'ATENDIDO') {
                                      await handleAtendidoClick(appointmentManagement.selectedAppointmentForDetail);
                                    } else {
                                      await appointmentManagement.updateAppointmentStatus(appointmentManagement.selectedAppointmentForDetail.id, newStatus);
                                    }
                                    // Forzar recarga de datos del calendario después de cambiar estado
                                    await calendarManagement.handleDaySelect(calendarManagement.selectedDate);
                                    appointmentManagement.handleCloseAppointmentDetailModal();
                                  }
                                }
                              }}
                              disabled={appointmentManagement.updatingStatus[appointmentManagement.selectedAppointmentForDetail.id]}
                              className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white transition-colors duration-200 ${
                                newStatus === 'EN_SALA'
                                  ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                  : newStatus === 'ATENDIDO'
                                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                  : newStatus === 'NO_SE_PRESENTO'
                                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                  : newStatus === 'CANCELADA'
                                  ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {appointmentManagement.updatingStatus[appointmentManagement.selectedAppointmentForDetail.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : null}
                              {newStatus === 'PROGRAMADO' ? 'Programado' :
                               newStatus === 'EN_SALA' ? 'En Sala' :
                               newStatus === 'ATENDIDO' ? 'Atendido' :
                               newStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                               newStatus === 'CANCELADA' ? 'Cancelar Cita' :
                               newStatus}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={appointmentManagement.handleCloseAppointmentDetailModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </MainLayout>
  );
};

export default PatientDashboard;