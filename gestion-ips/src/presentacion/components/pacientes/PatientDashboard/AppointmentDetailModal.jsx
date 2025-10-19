import React from 'react';
import { XMarkIcon, UserIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  selectedAppointment,
  appointmentDetailPatientInfo,
  loadingAppointmentDetailPatient,
  formatDate,
  getAppointmentInfo,
  getAppointmentPatientInfo,
  getAvailableStatusTransitions,
  updateAppointmentStatus,
  user,
  onAtendidoClick
}) => {
  if (!isOpen || !selectedAppointment) return null;

  const appointmentInfo = getAppointmentInfo(selectedAppointment);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Detalle de la Cita #{selectedAppointment.id}
            </h3>
            <button
              onClick={onClose}
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
                  Creada: {formatDate(selectedAppointment.fechaCreacion)}
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Información del Paciente
                </h4>
                {loadingAppointmentDetailPatient ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando información del paciente...</span>
                  </div>
                ) : appointmentDetailPatientInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Nombre Completo</p>
                      <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Documento</p>
                      <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.documento}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Teléfono</p>
                      <p className="text-sm text-gray-600">{appointmentDetailPatientInfo.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Estado</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        appointmentDetailPatientInfo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {appointmentDetailPatientInfo.estado}
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Acciones Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {getAvailableStatusTransitions(appointmentInfo.estado)
                    .filter(newStatus => {
                      // Solo mostrar ATENDIDO si el usuario tiene permisos (ADMIN o DOCTOR)
                      if (newStatus === 'ATENDIDO') {
                        return user && (user.rol === 'ADMIN' || user.rol === 'DOCTOR');
                      }
                      return true;
                    })
                    .map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={() => {
                        if (newStatus === 'ATENDIDO') {
                          onAtendidoClick(selectedAppointment);
                        } else {
                          updateAppointmentStatus(selectedAppointment.id, newStatus);
                        }
                        onClose();
                      }}
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
                      }`}
                    >
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
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
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
};

export default AppointmentDetailModal;
