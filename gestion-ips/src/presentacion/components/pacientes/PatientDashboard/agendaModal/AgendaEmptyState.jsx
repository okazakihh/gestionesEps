import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar el estado vacío de la agenda
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.hasCitas - Si hay citas en el sistema
 * @param {boolean} props.hasFilters - Si hay filtros aplicados
 * @param {string} props.userRole - Rol del usuario actual
 * @returns {JSX.Element} Estado vacío
 */
const AgendaEmptyState = ({ hasCitas, hasFilters, userRole }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {hasCitas ? 'No hay citas que coincidan con los filtros' : 'No hay citas programadas'}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {hasCitas
          ? (userRole === 'DOCTOR' || userRole === 'AUXILIAR_MEDICO')
            ? 'No tienes citas asignadas en este período.'
            : 'Intenta ajustar los filtros de búsqueda.'
          : 'No hay citas programadas en el sistema.'
        }
      </p>
    </div>
  );
};

export default AgendaEmptyState;