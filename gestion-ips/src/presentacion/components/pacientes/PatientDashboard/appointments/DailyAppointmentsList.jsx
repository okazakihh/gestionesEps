import React from 'react';

/**
 * Componente que muestra la lista de citas programadas del día
 */
const DailyAppointmentsList = ({
  selectedDate,
  user,
  loadingAppointments,
  allDoctorAppointments,
  getAppointmentInfo,
  updateAppointmentStatus,
  updatingStatus
}) => {
  if (!selectedDate) return null;

  const isDoctor = user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');

  // Verificar si hay citas no atendidas
  const hasUnattendedAppointments = Object.values(allDoctorAppointments).some(doctorData =>
    doctorData.appointments.some(appointment => {
      try {
        const appointmentData = JSON.parse(appointment.datosJson || '{}');
        return appointmentData.estado !== 'ATENDIDO';
      } catch (error) {
        return true;
      }
    })
  );

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        {isDoctor
          ? `Mis Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
          : `Todas las Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
        }
      </h4>

      {loadingAppointments ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando citas...</p>
        </div>
      ) : hasUnattendedAppointments ? (
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
                const appointmentInfo = getAppointmentInfo(appointment);

                return (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {(() => {
                              try {
                                const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                return appointmentData.pacienteNombre || 'Paciente';
                              } catch (error) {
                                return 'N/A';
                              }
                            })()}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
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
                        </div>
                        <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                          <p>
                            <span className="font-medium">Tipo:</span>{' '}
                            {(() => {
                              try {
                                const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                const informacionCups = appointmentData.informacionCups;
                                if (informacionCups && informacionCups.tipo) {
                                  return informacionCups.tipo;
                                }
                                return 'REVISION PERIODICA';
                              } catch (error) {
                                return 'REVISION PERIODICA';
                              }
                            })()}
                          </p>
                          <p>
                            <span className="font-medium">Duración:</span>{' '}
                            {(() => {
                              try {
                                const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                return `${appointmentData.duracion || 30} min`;
                              } catch (error) {
                                return ' (30 min)';
                              }
                            })()}
                          </p>
                          <p>
                            <span className="font-medium">Doctor:</span> {doctorData.doctorName}
                          </p>
                        </div>
                      </div>

                      {/* Estado change buttons */}
                      <div className="flex flex-col space-y-1">
                        {(() => {
                          try {
                            const appointmentData = JSON.parse(appointment.datosJson || '{}');
                            const currentStatus = appointmentData.estado || 'PROGRAMADO';
                            const statusLabel = currentStatus === 'PROGRAMADO' ? 'Programado' :
                                              currentStatus === 'EN_SALA' ? 'En Sala' :
                                              currentStatus === 'ATENDIDO' ? 'Atendido' :
                                              currentStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                              currentStatus === 'CANCELADA' ? 'Cancelada' :
                                              currentStatus;

                            const transitions = {
                              'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'],
                              'EN_SALA': ['ATENDIDO'],
                              'ATENDIDO': [],
                              'NO_SE_PRESENTO': [],
                              'CANCELADA': []
                            };

                            const availableTransitions = transitions[currentStatus] || [];

                            return availableTransitions.map(newStatus => (
                              <button
                                key={newStatus}
                                onClick={async () => {
                                  await updateAppointmentStatus(appointment.id, newStatus);
                                }}
                                disabled={updatingStatus[appointment.id]}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  updatingStatus[appointment.id]
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : `bg-${
                                        newStatus === 'EN_SALA' ? 'yellow' :
                                        newStatus === 'ATENDIDO' ? 'green' :
                                        newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                        newStatus === 'CANCELADA' ? 'gray' : 'blue'
                                      }-100 text-${
                                        newStatus === 'EN_SALA' ? 'yellow' :
                                        newStatus === 'ATENDIDO' ? 'green' :
                                        newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                        newStatus === 'CANCELADA' ? 'gray' : 'blue'
                                      }-800 hover:bg-${
                                        newStatus === 'EN_SALA' ? 'yellow' :
                                        newStatus === 'ATENDIDO' ? 'green' :
                                        newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                        newStatus === 'CANCELADA' ? 'gray' : 'blue'
                                      }-200`
                                }`}
                              >
                                {updatingStatus[appointment.id] ? 'Actualizando...' : 
                                  newStatus === 'EN_SALA' ? 'Marcar En Sala' :
                                  newStatus === 'ATENDIDO' ? 'Marcar Atendido' :
                                  newStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                  newStatus === 'CANCELADA' ? 'Cancelar' :
                                  newStatus
                                }
                              </button>
                            ));
                          } catch (error) {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">No hay citas programadas para esta fecha</p>
        </div>
      )}
    </div>
  );
};

export default DailyAppointmentsList;
