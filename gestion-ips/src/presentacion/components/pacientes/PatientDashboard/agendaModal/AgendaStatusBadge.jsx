import React from 'react';
import { Badge } from '@mantine/core';

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
      'PROGRAMADO': 'blue',
      'EN_SALA': 'yellow',
      'ATENDIDO': 'green',
      'NO_SE_PRESENTO': 'red',
      'CANCELADO': 'gray'
    };
    return colors[status] || 'gray';
  };

  return (
    <Badge color={getStatusColor(status)} variant="light" size="sm">
      {getStatusLabel(status)}
    </Badge>
  );
};

export default AgendaStatusBadge;