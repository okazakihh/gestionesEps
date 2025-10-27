import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const DateTimeField = ({ value, onChange, min, errors }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
        Fecha y Hora *
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange('fechaHoraCita', e.target.value)}
        min={min}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.fechaHoraCita ? 'border-red-300' : 'border-gray-300'
        }`}
        required
      />
      {errors.fechaHoraCita && (
        <p className="mt-1 text-sm text-red-600">{errors.fechaHoraCita}</p>
      )}
    </div>
  );
};

export default DateTimeField;