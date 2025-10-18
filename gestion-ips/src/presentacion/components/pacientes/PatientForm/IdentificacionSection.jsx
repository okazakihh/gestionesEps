import React from 'react';
import { TIPOS_DOCUMENTO } from '@/negocio/utils/loadHelpers.js';

/**
 * IdentificacionSection - Sección de identificación del paciente
 */
const IdentificacionSection = ({ formData, parsedData, validationErrors, onInputChange, onNestedInputChange, disabled = false }) => {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Identificación</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="tipoDocumento" className="block text-sm font-medium leading-6 text-gray-900">
              Tipo de Documento
            </label>
            <select
              id="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={(e) => onInputChange('tipoDocumento', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {TIPOS_DOCUMENTO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="numeroDocumento" className="block text-sm font-medium leading-6 text-gray-900">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={(e) => onInputChange('numeroDocumento', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.numeroDocumento ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            />
            {validationErrors.numeroDocumento && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDocumento}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentificacionSection;
