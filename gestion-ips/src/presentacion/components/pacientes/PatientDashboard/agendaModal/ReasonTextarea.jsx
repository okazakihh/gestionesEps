import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const ReasonTextarea = ({ value, onChange, errors }) => {
  return (
    <div className="lg:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <DocumentTextIcon className="h-4 w-4 inline mr-2" />
        Motivo de la Consulta *
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange('motivo', e.target.value)}
        rows={2}
        placeholder="Describa el motivo de la consulta médica..."
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.motivo ? 'border-red-300' : 'border-gray-300'
        }`}
        required
      />
      {errors.motivo && (
        <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
      )}
    </div>
  );
};

export default ReasonTextarea;