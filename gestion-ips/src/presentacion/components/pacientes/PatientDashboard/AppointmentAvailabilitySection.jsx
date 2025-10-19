import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ActionIcon, Group } from '@mantine/core';
import { UserIcon } from '@heroicons/react/24/outline';

const AppointmentAvailabilitySection = ({
  selectedDate,
  user,
  allDoctorAppointments,
  loadingAppointments,
  calculateAvailableSlots,
  handleSlotClick,
  getDoctorInitials,
  handleViewAppointmentDetail,
  // getFilteredTransitions, // Removed as it's not available in the hook
  handleStatusChange,
  updatingStatus
}) => {
  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Selecciona un día</h3>
          <p className="text-xs text-gray-500">Haz click en un día del calendario para ver la disponibilidad de citas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2" />
        Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
        {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO') && (
          <span className="ml-2 text-sm font-normal text-blue-600">(Vista Personal)</span>
        )}
      </h3>

      <div className="space-y-6">
        {/* Time slots for all doctors */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
              ? 'Mis Horarios Disponibles'
              : 'Horarios Disponibles por Doctor'
            }
          </h4>

          {loadingAppointments ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Cargando horarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <div className="grid grid-cols-5 gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) => {
                  const { doctor, doctorName, appointments: doctorAppointments } = doctorData;
                  const availableSlots = calculateAvailableSlots(doctorAppointments, selectedDate);

                  return (
                    <div key={doctorId} className="border border-gray-200 rounded-lg p-3 min-w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800">
                            {getDoctorInitials(doctorName)}
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
                            onClick={() => {
                              console.log('Slot clicked:', { slot, selectedDate, doctorId });
                              slot.available && handleSlotClick({
                                ...slot,
                                date: selectedDate,
                                doctorId: doctorId
                              });
                            }}
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
              ? `Mis Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
              : `Todas las Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
            }
          </h4>

          {loadingAppointments ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando citas...</p>
            </div>
          ) : Object.values(allDoctorAppointments).some(doctorData =>
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
              {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) =>
                doctorData.appointments
                  .filter(appointment => {
                    try {
                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                      return appointmentData.estado !== 'ATENDIDO';
                    } catch (error) {
                      return true;
                    }
                  })
                  .map((appointment) => {
                    console.log('Rendering appointment:', appointment.id, 'patient:', appointment.patient);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800">
                          {getDoctorInitials(doctorData.doctorName)}
                        </span>
                      </div>
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium">{appointment.time} - {appointment.patient || 'Paciente'}</span>
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
                        {(() => {
                          try {
                            const appointmentData = JSON.parse(appointment.datosJson || '{}');
                            const currentStatus = appointmentData.estado || 'PROGRAMADO';
                            const availableTransitions = (() => {
                              if (currentStatus === 'PROGRAMADO') return ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'];
                              if (currentStatus === 'EN_SALA') return ['ATENDIDO'];
                              return [];
                            })().filter(newStatus => newStatus !== 'ATENDIDO');

                            return availableTransitions.map((newStatus) => (
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
                                onClick={() => handleStatusChange(appointment.id, newStatus)}
                                disabled={updatingStatus[appointment.id]}
                                title={newStatus === 'EN_SALA' ? 'En Sala' :
                                      newStatus === 'ATENDIDO' ? 'Atendido' :
                                      newStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                      newStatus === 'CANCELADA' ? 'Cancelar Cita' :
                                      newStatus}
                                loading={updatingStatus[appointment.id]}
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
                            ));
                          } catch (error) {
                            return null;
                          }
                        })()}
                      </Group>
                    </div>
                  </div>
                    );
                  })
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
  );
};

export default AppointmentAvailabilitySection;