import React from 'react';
import { CalendarDaysIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar las tarjetas de estadísticas de la agenda
 * @param {Object} props - Propiedades del componente
 * @param {number} props.pendingCitas - Número de citas pendientes
 * @param {Array} props.citas - Lista de todas las citas
 * @param {Object} props.filters - Filtros aplicados
 * @param {Object} props.user - Usuario actual
 * @param {Function} props.formatDate - Función para formatear fechas
 * @returns {JSX.Element} Tarjetas de estadísticas
 */
const AgendaStatsCards = ({ pendingCitas, citas, filters, user, formatDate }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg border">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Citas Pendientes
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pendingCitas.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg border">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Próxima Cita
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pendingCitas.length > 0 ? formatDate(pendingCitas[0]?.fechaCreacion) : 'Ninguna'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg border">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pacientes Atendidos
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {(() => {
                    // Filter citas by date range, ATENDIDO status, and user role
                    let atendidasEnRango = citas.filter(cita => {
                      const citaInfo = getCitaInfo(cita);
                      if (citaInfo.estado !== 'ATENDIDO') return false;

                      // Apply date filters
                      if (filters.fechaInicio) {
                        const startDate = new Date(filters.fechaInicio);
                        if (citaInfo.fechaHoraCita) {
                          const citaDate = new Date(citaInfo.fechaHoraCita);
                          if (citaDate < startDate) return false;
                        }
                      }

                      if (filters.fechaFin) {
                        const endDate = new Date(filters.fechaFin);
                        endDate.setHours(23, 59, 59, 999);
                        if (citaInfo.fechaHoraCita) {
                          const citaDate = new Date(citaInfo.fechaHoraCita);
                          if (citaDate > endDate) return false;
                        }
                      }

                      // For doctors, only count appointments they attended
                      if (user?.rol === 'DOCTOR' || user?.rol === 'AUXILIAR_MEDICO') {
                        const assignedDoctor = citaInfo.medicoAsignado;
                        const currentUserName = `${user.nombres} ${user.apellidos}`.trim();
                        return assignedDoctor && (
                          assignedDoctor.toLowerCase().includes(currentUserName.toLowerCase()) ||
                          assignedDoctor.toLowerCase().includes(user.nombres.toLowerCase()) ||
                          assignedDoctor.toLowerCase().includes(user.apellidos.toLowerCase())
                        );
                      }

                      return true;
                    });

                    return new Set(atendidasEnRango.map(cita => cita.pacienteId)).size;
                  })()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get cita info (should be moved to utils)
const getCitaInfo = (cita) => {
  try {
    if (cita.datosJson) {
      const citaData = typeof cita.datosJson === 'string' ? JSON.parse(cita.datosJson) : cita.datosJson;
      const informacionCups = citaData.informacionCups || null;
      let estado = citaData.estado || 'PROGRAMADO';

      if (typeof estado === 'string') {
        estado = estado.toUpperCase();
      }

      const estadoMapping = {
        'PROGRAMADO': 'PROGRAMADO',
        'PROGRAMADA': 'PROGRAMADO',
        'EN_SALA': 'EN_SALA',
        'EN SALA': 'EN_SALA',
        'ATENDIDO': 'ATENDIDO',
        'ATENDIDA': 'ATENDIDO',
        'NO_SE_PRESENTO': 'NO_SE_PRESENTO',
        'NO SE PRESENTO': 'NO_SE_PRESENTO',
        'NO SE PRESENTÓ': 'NO_SE_PRESENTO'
      };

      estado = estadoMapping[estado] || estado;

      return {
        fechaHoraCita: citaData.fechaHoraCita || null,
        estado: estado,
        medicoAsignado: citaData.medicoAsignado || 'N/A',
        informacionCups: informacionCups
      };
    }
  } catch (error) {
    console.error('Error parsing cita data for stats:', error);
  }

  return {
    fechaHoraCita: null,
    estado: 'PROGRAMADO',
    medicoAsignado: 'N/A',
    informacionCups: null
  };
};

export default AgendaStatsCards;