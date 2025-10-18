import React from 'react';
import { REGIMENES_AFILIACION, TIPOS_POBLACION, TIPOS_SANGRE } from '@/negocio/utils/loadHelpers.js';

/**
 * InformacionMedicaSection - Sección de información médica del paciente
 */
const InformacionMedicaSection = ({ parsedData, validationErrors, onNestedInputChange, disabled = false }) => {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Médica</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          {/* EPS y Régimen */}
          <div className="sm:col-span-3">
            <label htmlFor="eps" className="block text-sm font-medium leading-6 text-gray-900">
              EPS <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eps"
              value={parsedData.informacionMedica?.eps || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'eps', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.eps ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
              placeholder="Nombre de la EPS..."
            />
            {validationErrors.eps && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.eps}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="regimenAfiliacion" className="block text-sm font-medium leading-6 text-gray-900">
              Régimen de Afiliación <span className="text-red-500">*</span>
            </label>
            <select
              id="regimenAfiliacion"
              value={parsedData.informacionMedica?.regimenAfiliacion || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'regimenAfiliacion', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.regimenAfiliacion ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            >
              <option value="">Seleccionar...</option>
              {REGIMENES_AFILIACION.map(regimen => (
                <option key={regimen.value} value={regimen.value}>
                  {regimen.label}
                </option>
              ))}
            </select>
            {validationErrors.regimenAfiliacion && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.regimenAfiliacion}</p>
            )}
          </div>

          {/* Tipo de Población */}
          <div className="sm:col-span-3">
            <label htmlFor="tipoPoblacion" className="block text-sm font-medium leading-6 text-gray-900">
              Tipo de Población
            </label>
            <select
              id="tipoPoblacion"
              value={parsedData.informacionMedica?.tipoPoblacion || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'tipoPoblacion', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar...</option>
              {TIPOS_POBLACION.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Clasificación para grupos poblacionales especiales
            </p>
          </div>

          {/* Alergias */}
          <div className="sm:col-span-6">
            <label htmlFor="alergias" className="block text-sm font-medium leading-6 text-gray-900">
              Alergias
            </label>
            <textarea
              id="alergias"
              rows={3}
              value={parsedData.informacionMedica?.alergias || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'alergias', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describa las alergias del paciente..."
            />
          </div>

          {/* Medicamentos Actuales */}
          <div className="sm:col-span-6">
            <label htmlFor="medicamentosActuales" className="block text-sm font-medium leading-6 text-gray-900">
              Medicamentos Actuales
            </label>
            <textarea
              id="medicamentosActuales"
              rows={3}
              value={parsedData.informacionMedica?.medicamentosActuales || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'medicamentosActuales', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Liste los medicamentos que toma actualmente..."
            />
          </div>

          {/* Antecedentes Personales */}
          <div className="sm:col-span-6">
            <label htmlFor="antecedentesPersonales" className="block text-sm font-medium leading-6 text-gray-900">
              Antecedentes Médicos Personales
            </label>
            <textarea
              id="antecedentesPersonales"
              rows={3}
              value={parsedData.informacionMedica?.antecedentesPersonales || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'antecedentesPersonales', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describa enfermedades previas, cirugías, hospitalizaciones..."
            />
          </div>

          {/* Antecedentes Familiares */}
          <div className="sm:col-span-6">
            <label htmlFor="antecedentesFamiliares" className="block text-sm font-medium leading-6 text-gray-900">
              Antecedentes Médicos Familiares
            </label>
            <textarea
              id="antecedentesFamiliares"
              rows={3}
              value={parsedData.informacionMedica?.antecedentesFamiliares || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'antecedentesFamiliares', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enfermedades en familiares directos (padres, hermanos, hijos)..."
            />
          </div>

          {/* Enfermedades Crónicas */}
          <div className="sm:col-span-6">
            <label htmlFor="enfermedadesCronicas" className="block text-sm font-medium leading-6 text-gray-900">
              Enfermedades Crónicas
            </label>
            <textarea
              id="enfermedadesCronicas"
              rows={2}
              value={parsedData.informacionMedica?.enfermedadesCronicas || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'enfermedadesCronicas', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Diabetes, hipertensión, asma, etc."
            />
          </div>

          {/* Vacunas */}
          <div className="sm:col-span-6">
            <label htmlFor="vacunas" className="block text-sm font-medium leading-6 text-gray-900">
              Vacunas y Esquemas de Inmunización
            </label>
            <textarea
              id="vacunas"
              rows={2}
              value={parsedData.informacionMedica?.vacunas || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'vacunas', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Vacunas aplicadas y fechas..."
            />
          </div>

          {/* Observaciones Médicas */}
          <div className="sm:col-span-6">
            <label htmlFor="observacionesMedicas" className="block text-sm font-medium leading-6 text-gray-900">
              Observaciones Médicas Adicionales
            </label>
            <textarea
              id="observacionesMedicas"
              rows={3}
              value={parsedData.informacionMedica?.observacionesMedicas || ''}
              onChange={(e) => onNestedInputChange('informacionMedica', 'observacionesMedicas', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Observaciones adicionales del estado de salud..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionMedicaSection;
