import React from 'react';

/**
 * Componente para mostrar el badge de estado de una cita
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado de la cita
 * @returns {JSX.Element} Badge de estado
 */
const AgendaStatusBadge = ({ status }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      'PROGRAMADO': 'bg-blue-100 text-blue-800',
      'EN_SALA': 'bg-yellow-100 text-yellow-800',
      'ATENDIDO': 'bg-green-100 text-green-800',
      'NO_SE_PRESENTO': 'bg-red-100 text-red-800',
      'CANCELADO': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default AgendaStatusBadge;