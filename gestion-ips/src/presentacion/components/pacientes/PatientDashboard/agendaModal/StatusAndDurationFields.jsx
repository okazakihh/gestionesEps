import React from 'react';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ESTADO_CITA_AGENDAR_OPTIONS, DURACION_CITA_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const StatusAndDurationFields = ({ estado, duracion, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CheckIcon className="h-4 w-4 inline mr-2" />
          Estado
        </label>
        <select
          value={estado}
          onChange={(e) => onChange('estado', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ESTADO_CITA_AGENDAR_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <ClockIcon className="h-4 w-4 inline mr-2" />
          Duración
        </label>
        <select
          value={duracion || '30'}
          onChange={(e) => onChange('duracion', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DURACION_CITA_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StatusAndDurationFields;