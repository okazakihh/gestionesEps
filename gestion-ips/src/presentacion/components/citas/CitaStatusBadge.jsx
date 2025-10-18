import React from 'react';
import { getEstadoCitaLabel, getEstadoCitaClass } from '../../../negocio/utils/citaUtils';

/**
 * CitaStatusBadge - Badge para mostrar el estado de una cita
 */
const CitaStatusBadge = ({ estado }) => {
  const { label, color } = getEstadoCitaLabel(estado);
  const classes = getEstadoCitaClass(estado);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
      {label}
    </span>
  );
};

export default CitaStatusBadge;
