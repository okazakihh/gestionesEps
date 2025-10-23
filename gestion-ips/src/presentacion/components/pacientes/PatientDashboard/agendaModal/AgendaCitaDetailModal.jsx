import React from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon, UserIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import AgendaStatusBadge from './AgendaStatusBadge.jsx';
import Swal from 'sweetalert2';

/**
 * Componente para el modal de detalle de cita
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.cita - Datos de la cita
 * @param {Object} props.citaInfo - Información parseada de la cita
 * @param {Object} props.pacienteInfo - Información del paciente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.formatDate - Función para formatear fechas
 * @param {Array} props.availableStatusTransitions - Transiciones de estado disponibles
 * @param {Function} props.onStatusChange - Función para cambiar estado
 * @param {Object} props.updatingStatus - Estados de carga de actualización
 * @returns {JSX.Element} Modal de detalle de cita
 */
const AgendaCitaDetailModal = ({
  cita,
  citaInfo,
  pacienteInfo,
  onClose,
  formatDate,
  availableStatusTransitions,
  onStatusChange,
  updatingStatus
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <button
            type="button"
            className="absolute inset-0 bg-gray-500 opacity-75"
            aria-label="Cerrar modal"
            onClick={onClose}
            onTouchStart={onClose}
          ></button>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Detalle de la Cita #{cita.id}
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
                  <AgendaStatusBadge status={citaInfo.estado} />
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{citaInfo.fechaHoraCita ? formatDate(citaInfo.fechaHoraCita) : 'Fecha no disponible'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Creada: {formatDate(cita.fechaCreacion)}
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Información del Paciente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Nombre Completo</p>
                    <p className="text-sm text-gray-600">{pacienteInfo.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Documento</p>
                    <p className="text-sm text-gray-600">{pacienteInfo.documento}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Teléfono</p>
                    <p className="text-sm text-gray-600">{pacienteInfo.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cita.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cita.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
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
                    <p className="text-sm text-blue-700">{citaInfo.especialidad}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Médico Asignado</p>
                    <p className="text-sm text-blue-700">{citaInfo.medicoAsignado}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Tipo de Cita</p>
                    <p className="text-sm text-blue-700">{citaInfo.tipoCita}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Motivo</p>
                    <p className="text-sm text-blue-700">{citaInfo.motivo}</p>
                  </div>
                </div>

                {/* Notas adicionales */}
                {citaInfo.notas && citaInfo.notas !== 'Sin notas' && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Notas Adicionales</p>
                    <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">{citaInfo.notas}</p>
                  </div>
                )}
              </div>

              {/* Información CUPS */}
              {citaInfo.codigoCups && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Código CUPS
                  </h4>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-green-900">Código:</span>
                    <span className="ml-2 text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">{citaInfo.codigoCups}</span>
                  </div>
                  {citaInfo.informacionCups && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {citaInfo.informacionCups.categoria && (
                        <div>
                          <span className="text-xs font-medium text-green-800">Categoría:</span>
                          <span className="ml-1 text-xs text-green-700">{citaInfo.informacionCups.categoria}</span>
                        </div>
                      )}
                      {citaInfo.informacionCups.tipo && (
                        <div>
                          <span className="text-xs font-medium text-green-800">Tipo:</span>
                          <span className="ml-1 text-xs text-green-700">{citaInfo.informacionCups.tipo}</span>
                        </div>
                      )}
                      {citaInfo.informacionCups.ambito && (
                        <div>
                          <span className="text-xs font-medium text-green-800">Ámbito:</span>
                          <span className="ml-1 text-xs text-green-700">{citaInfo.informacionCups.ambito}</span>
                        </div>
                      )}
                      {citaInfo.informacionCups.equipo_requerido && (
                        <div>
                          <span className="text-xs font-medium text-green-800">Equipo Requerido:</span>
                          <span className="ml-1 text-xs text-green-700">{citaInfo.informacionCups.equipo_requerido}</span>
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
                  {availableStatusTransitions.map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={async () => {
                        // Confirmación para acciones críticas
                        if (newStatus === 'ATENDIDO') {
                          // Para ATENDIDO, mostrar confirmación especial
                          const result = await Swal.fire({
                            title: '¿Marcar cita como atendida?',
                            text: 'Esta acción creará automáticamente la historia clínica y consulta médica si no existen. ¿Desea continuar?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#10B981',
                            cancelButtonColor: '#6B7280',
                            confirmButtonText: 'Sí, marcar como atendida',
                            cancelButtonText: 'Cancelar'
                          });

                          if (result.isConfirmed) {
                            try {
                              await onStatusChange(cita.id, newStatus);
                              Swal.fire({
                                title: '¡Éxito!',
                                text: 'La cita ha sido marcada como atendida.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                              });
                            } catch (error) {
                              console.error('Error updating appointment status:', error);
                              Swal.fire({
                                title: 'Error',
                                text: error.message || 'No se pudo actualizar el estado de la cita.',
                                icon: 'error'
                              });
                            }
                          }
                        } else if (newStatus === 'CANCELADO') {
                          // Confirmación especial para cancelar
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
                            try {
                              await onStatusChange(cita.id, newStatus);
                              Swal.fire({
                                title: 'Cita Cancelada',
                                text: 'La cita ha sido cancelada exitosamente.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                              });
                            } catch (error) {
                              console.error('Error updating appointment status:', error);
                              Swal.fire({
                                title: 'Error',
                                text: error.message || 'No se pudo cancelar la cita.',
                                icon: 'error'
                              });
                            }
                          }
                        } else {
                          // Para otros estados, confirmación simple
                          const statusLabels = {
                            'EN_SALA': 'En Sala',
                            'NO_SE_PRESENTO': 'No se Presentó'
                          };

                          const result = await Swal.fire({
                            title: `¿Cambiar estado a "${statusLabels[newStatus] || newStatus}"?`,
                            text: '¿Está seguro de que desea cambiar el estado de esta cita?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#3B82F6',
                            cancelButtonColor: '#6B7280',
                            confirmButtonText: 'Sí, cambiar estado',
                            cancelButtonText: 'Cancelar'
                          });

                          if (result.isConfirmed) {
                            try {
                              await onStatusChange(cita.id, newStatus);
                              Swal.fire({
                                title: '¡Éxito!',
                                text: `El estado de la cita ha sido cambiado a "${statusLabels[newStatus] || newStatus}".`,
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                              });
                            } catch (error) {
                              console.error('Error updating appointment status:', error);
                              Swal.fire({
                                title: 'Error',
                                text: error.message || 'No se pudo actualizar el estado de la cita.',
                                icon: 'error'
                              });
                            }
                          }
                        }
                      }}
                      disabled={updatingStatus[cita.id]}
                      className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white transition-colors duration-200 ${
                        newStatus === 'EN_SALA'
                          ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                          : newStatus === 'ATENDIDO'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : newStatus === 'NO_SE_PRESENTO'
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : newStatus === 'CANCELADO'
                          ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingStatus[cita.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {getStatusLabel(newStatus)}
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
// Helper function for status labels
const getStatusLabel = (status) => {
  const labels = {
    'PROGRAMADO': 'Programado',
    'EN_SALA': 'En Sala',
    'ATENDIDO': 'Atendido',
    'NO_SE_PRESENTO': 'No se Presentó',
    'CANCELADO': 'Cancelado'
  };
  return labels[status] || status;
};

AgendaCitaDetailModal.propTypes = {
  cita: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    fechaCreacion: PropTypes.string,
    activo: PropTypes.bool
  }).isRequired,
  citaInfo: PropTypes.shape({
    estado: PropTypes.string,
    fechaHoraCita: PropTypes.string,
    especialidad: PropTypes.string,
    medicoAsignado: PropTypes.string,
    tipoCita: PropTypes.string,
    motivo: PropTypes.string,
    notas: PropTypes.string,
    codigoCups: PropTypes.string,
    informacionCups: PropTypes.object
  }).isRequired,
  pacienteInfo: PropTypes.shape({
    nombre: PropTypes.string,
    documento: PropTypes.string,
    telefono: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  availableStatusTransitions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  updatingStatus: PropTypes.object.isRequired
};


export default AgendaCitaDetailModal;